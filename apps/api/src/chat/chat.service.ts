import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Response } from 'express';
import { formatLlmError } from '../common/llm-error';
import { isPremium, FREE_LIMITS } from '../common/membership';
import {
  buildKnowledgeLlmContent,
  type AskMode,
} from '../common/knowledge-prompts';
import { ROLE_IDS, getRolePrompt } from '../common/role-prompts';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatSession } from '../entities/chat-session.entity';
import { User } from '../entities/user.entity';
import { LlmService } from '../llm/llm.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
type KnowledgeTopicDetail = Awaited<ReturnType<KnowledgeService['getBySlug']>>;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatSession)
    private readonly sessions: Repository<ChatSession>,
    @InjectRepository(ChatMessage)
    private readonly messages: Repository<ChatMessage>,
    private readonly llm: LlmService,
    private readonly knowledge: KnowledgeService,
  ) {}

  private async assertSession(userId: string, sessionId: string) {
    const session = await this.sessions.findOne({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('会话不存在');
    if (session.userId !== userId) throw new ForbiddenException('无权访问该会话');
    return session;
  }

  private stripFrontmatter(md: string) {
    return md.replace(/^---[\s\S]*?---\s*/, '').trim();
  }

  private toPlainText(md: string) {
    return this.stripFrontmatter(md)
      .replace(/\$\$?([^$]+)\$\$?/g, '$1')
      .replace(/^#{1,6}\s*/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+\.\s+/gm, '')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/\|/g, ' ')
      .replace(/\n{2,}/g, '\n')
      .trim();
  }

  private extractKeyPoints(md: string, max = 4) {
    const seen = new Set<string>();
    const lines = this.stripFrontmatter(md)
      .split('\n')
      .map((line) =>
        line
          .trim()
          .replace(/^#{1,6}\s*/, '')
          .replace(/^[-*+]\s+/, '')
          .replace(/^\d+\.\s+/, '')
          .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
          .replace(/`([^`]*)`/g, '$1')
          .replace(/\$\$?([^$]+)\$\$?/g, '$1')
          .trim(),
      )
      .filter(Boolean);

    const points: string[] = [];
    for (const line of lines) {
      if (line.startsWith('title:')) continue;
      if (line.length < 4 || line.length > 60) continue;
      const normalized = line
        .replace(/\*\*/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
      if (!normalized || seen.has(normalized)) continue;
      if ([...seen].some((item) => item.includes(normalized) || normalized.includes(item))) {
        continue;
      }
      seen.add(normalized);
      points.push(line);
      if (points.length >= max) break;
    }
    return points;
  }

  private summarizeTopic(md: string, maxLength = 180) {
    const text = this.toPlainText(md).replace(/\n/g, ' ');
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength).trim()}...`;
  }

  private buildSearchQueries(input: string) {
    const cleaned = input
      .replace(/[？?！!。.,，；;：:（）()\[\]【】]/g, ' ')
      .replace(
        /(请问|请|帮我|给我|一下|一个|简单|讲讲|讲一下|解释一下|解释|说明一下|说明|分析一下|分析|关于|怎么|为什么|如何|麻烦|可以|能否)/g,
        ' ',
      )
      .replace(/\s+/g, ' ')
      .trim();

    const merged = cleaned.replace(/\s+/g, '');
    const queries = new Set<string>();
    if (cleaned) queries.add(cleaned);

    for (const token of cleaned.split(' ').filter(Boolean)) {
      if (token.length >= 2) queries.add(token);
    }

    for (let size = Math.min(4, merged.length); size >= 2; size--) {
      for (let i = 0; i + size <= merged.length && queries.size < 12; i++) {
        queries.add(merged.slice(i, i + size));
      }
    }

    return [...queries];
  }

  private buildOfflineExplainReply(
    topic: KnowledgeTopicDetail,
    question: string,
    roleMode: string,
  ) {
    const summary = this.summarizeTopic(topic.mdBody);
    const points = this.extractKeyPoints(topic.mdBody);
    const intro = `当前云端 AI 服务暂时不可用，我先基于本地知识库给你一个离线参考回答。`;
    const header = `**匹配知识点**：${topic.title}${topic.chapterTitle ? `（${topic.chapterTitle}）` : ''}`;
    const parts = [intro, header];

    if (summary) {
      parts.push(`**核心说明**：${summary}`);
    }

    if (points.length > 0) {
      parts.push(`**关键点**\n- ${points.join('\n- ')}`);
    }

    if (roleMode === 'guide') {
      parts.push(
        `**你可以先自己想一想**\n1. 这个知识点最容易和什么概念混淆？\n2. 如果题目要求解释现象，你会先抓上面的哪一个关键点？`,
      );
    } else if (roleMode === 'direct' || roleMode === 'gaokao-sprint') {
      parts.push(`**速记版**：${points.slice(0, 3).join('；') || summary}`);
    } else {
      parts.push(`**继续追问建议**：把你卡住的那一步直接发出来，例如“为什么会这样”“这一步怎么算”。`);
    }

    if (question.trim()) {
      parts.push(`**对应你刚才的问题**：${question.trim()}`);
    }

    return parts.join('\n\n');
  }

  private buildOfflinePracticeReply(topic: KnowledgeTopicDetail) {
    const points = this.extractKeyPoints(topic.mdBody, 5);
    const summary = this.summarizeTopic(topic.mdBody, 120);
    const p1 = points[0] ?? summary;
    const p2 = points[1] ?? points[0] ?? summary;
    const p3 = points[2] ?? points[1] ?? summary;

    return [
      '当前云端 AI 服务暂时不可用，我先基于本地知识库给你一组离线练习题。',
      `**知识点**：${topic.title}${topic.chapterTitle ? `（${topic.chapterTitle}）` : ''}`,
      '**练习题**',
      `1. 概念题：请用自己的话概括「${topic.title}」的核心内容。`,
      `参考答案：可围绕「${p1}」来回答。`,
      `2. 要点题：写出与「${topic.title}」相关的两个关键点。`,
      `参考答案：例如「${p1}」和「${p2}」。`,
      `3. 应用题：如果题目考到「${topic.title}」，你会优先检查哪一个判断点或决定因素？`,
      `参考答案：通常先抓「${p3}」，再结合题目已知条件分析。`,
      '**复习建议**',
      `- 先把上面 3 题口头讲通一遍`,
      `- 再根据知识点中的关键词做 1 次默写：${points.slice(0, 3).join('；') || summary}`,
    ].join('\n\n');
  }

  private async resolveFallbackTopic(knowledgeSlug: string | undefined, question: string) {
    if (knowledgeSlug) {
      return this.knowledge.getBySlug(knowledgeSlug).catch(() => null);
    }

    for (const query of this.buildSearchQueries(question)) {
      const results = await this.knowledge.search(query).catch(() => []);
      const top = results[0];
      if (!top?.slug) continue;
      const topic = await this.knowledge.getBySlug(top.slug).catch(() => null);
      if (topic) return topic;
    }

    return null;
  }

  private async buildLocalFallbackReply(
    dto: SendMessageDto,
    displayContent: string,
    roleMode: string,
  ) {
    const topic = await this.resolveFallbackTopic(
      dto.knowledgeSlug,
      displayContent || dto.content,
    );

    if (!topic) {
      return [
        '当前云端 AI 服务暂时不可用，我先尝试用本地知识库兜底，但这次没有精确匹配到对应知识点。',
        '**你可以这样继续**',
        '- 把问题改成更短的关键词，例如“摩尔”“反应速率”“离子反应”',
        '- 或者先在页面上选择一个知识点，再继续提问',
        '- 云端模型恢复后，同样的问题也可以再试一次',
      ].join('\n\n');
    }

    if (dto.askMode === 'practice') {
      return this.buildOfflinePracticeReply(topic);
    }

    return this.buildOfflineExplainReply(topic, displayContent, roleMode);
  }

  private async saveConversation(
    session: ChatSession,
    sessionId: string,
    userContent: string,
    assistantContent: string,
    rawInput: string,
  ) {
    const userMsg = this.messages.create({
      sessionId,
      role: 'user',
      content: userContent,
    });
    const assistantMsg = this.messages.create({
      sessionId,
      role: 'assistant',
      content: assistantContent,
    });
    await this.messages.save([userMsg, assistantMsg]);

    session.updatedAt = new Date();
    if (session.title === '新对话') {
      session.title = rawInput.trim().slice(0, 24) || '新对话';
    }
    await this.sessions.save(session);
  }

  private async respondWithLocalFallback(
    res: Response,
    session: ChatSession,
    sessionId: string,
    dto: SendMessageDto,
    displayContent: string,
    roleMode: string,
  ) {
    const assistantText = await this.buildLocalFallbackReply(
      dto,
      displayContent,
      roleMode,
    );
    await this.saveConversation(
      session,
      sessionId,
      displayContent,
      assistantText,
      dto.content,
    );
    res.write(`data: ${JSON.stringify({ content: assistantText })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }

  listSessions(userId: string) {
    return this.sessions.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      select: ['id', 'title', 'roleMode', 'createdAt', 'updatedAt'],
    });
  }

  async createSession(userId: string, dto: CreateSessionDto, user: User) {
    const session = this.sessions.create({
      userId,
      title: dto.title?.trim() || '新对话',
      roleMode: dto.roleMode ?? user.defaultRole ?? 'guide',
    });
    return this.sessions.save(session);
  }

  async updateSession(userId: string, sessionId: string, dto: UpdateSessionDto) {
    const session = await this.assertSession(userId, sessionId);
    if (dto.title !== undefined) session.title = dto.title.trim() || session.title;
    if (dto.roleMode !== undefined) session.roleMode = dto.roleMode;
    return this.sessions.save(session);
  }

  async deleteSession(userId: string, sessionId: string) {
    const session = await this.assertSession(userId, sessionId);
    await this.sessions.remove(session);
    return { ok: true };
  }

  async listMessages(userId: string, sessionId: string) {
    await this.assertSession(userId, sessionId);
    return this.messages.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
      select: ['id', 'role', 'content', 'createdAt'],
    });
  }

  async streamReply(
    user: User,
    sessionId: string,
    dto: SendMessageDto,
    res: Response,
  ) {
    // Free user daily chat limit
    if (!isPremium(user)) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const userSessions = await this.sessions.find({
        where: { userId: user.id },
        select: ['id'],
      });
      const sessionIds = userSessions.map((s) => s.id);
      let totalToday = 0;
      if (sessionIds.length > 0) {
        totalToday = await this.messages
          .createQueryBuilder('m')
          .innerJoin('chat_sessions', 's', 's.id = m.session_id')
          .where('s.user_id = :userId', { userId: user.id })
          .andWhere('m.role = :role', { role: 'user' })
          .andWhere('m.created_at >= :start', { start: todayStart })
          .getCount();
      }
      if (totalToday >= FREE_LIMITS.dailyChatMessages) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();
        res.write(`data: ${JSON.stringify({ error: `今日免费对话次数已用完（${FREE_LIMITS.dailyChatMessages}次/天）。升级会员可无限对话。` })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
    }

    const session = await this.assertSession(user.id, sessionId);
    const roleMode = dto.roleMode ?? session.roleMode;
    if (dto.roleMode) {
      session.roleMode = dto.roleMode;
      await this.sessions.save(session);
    }

    const displayContent = dto.displayContent?.trim() || dto.content.trim();
    let llmContent = dto.content.trim();

    if (dto.knowledgeSlug) {
      const node = await this.knowledge.getBySlug(dto.knowledgeSlug).catch(() => null);
      if (node) {
        const mode: AskMode = dto.askMode ?? 'free';
        llmContent = buildKnowledgeLlmContent(node.mdBody, mode, dto.content, {
          title: node.title,
          chapterTitle: node.chapterTitle,
        });
      }
    }

    const history = await this.messages.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    let llm;
    try {
      llm = this.llm.getConfig();
    } catch {
      await this.respondWithLocalFallback(
        res,
        session,
        sessionId,
        dto,
        displayContent,
        roleMode,
      );
      return;
    }

    const systemPrompt = getRolePrompt(roleMode);

    const chatMessages = history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    chatMessages.push({ role: 'user', content: llmContent });

    const payload = {
      model: llm.modelName,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatMessages,
      ],
    };

    let assistantText = '';

    // Retry logic for upstream LLM requests
    let upstream: globalThis.Response | null = null;
    let lastError = '';

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${llm.apiBase}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${llm.apiKey}`,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(120000),
        });

        if (response.ok && response.body) {
          upstream = response;
          break;
        }

        // Check if retryable
        if (RETRYABLE_STATUS.has(response.status) && attempt < MAX_RETRIES) {
          lastError = await response.text().catch(() => `HTTP ${response.status}`);
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }

        // Non-retryable error or final attempt
        await response.text().catch(() => '上游模型请求失败');
        await this.respondWithLocalFallback(
          res,
          session,
          sessionId,
          dto,
          displayContent,
          roleMode,
        );
        return;
      } catch (e) {
        if (attempt < MAX_RETRIES) {
          lastError = e instanceof Error ? e.message : '网络请求失败';
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        await this.respondWithLocalFallback(
          res,
          session,
          sessionId,
          dto,
          displayContent,
          roleMode,
        );
        return;
      }
    }

    if (!upstream || !upstream.body) {
      await this.respondWithLocalFallback(
        res,
        session,
        sessionId,
        dto,
        displayContent,
        roleMode,
      );
      return;
    }

    const userMsg = this.messages.create({
      sessionId,
      role: 'user',
      content: displayContent,
    });
    await this.messages.save(userMsg);

    try {
      const reader = upstream.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));
        for (const line of lines) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data) as {
              choices?: { delta?: { content?: string } }[];
            };
            const delta = parsed.choices?.[0]?.delta?.content ?? '';
            if (delta) {
              assistantText += delta;
              res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
            }
          } catch {
            /* ignore partial json */
          }
        }
      }

      if (assistantText) {
        const assistantMsg = this.messages.create({
          sessionId,
          role: 'assistant',
          content: assistantText,
        });
        await this.messages.save(assistantMsg);
        session.updatedAt = new Date();
        if (session.title === '新对话') {
          session.title = dto.content.trim().slice(0, 24) || '新对话';
        }
        await this.sessions.save(session);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (e) {
      const message =
        e instanceof Error ? e.message : '对话请求失败，请稍后重试';
      const friendly = message.includes('timeout')
        ? 'AI 响应超时，请稍后重试'
        : message;
      res.write(`data: ${JSON.stringify({ error: friendly })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  async exportSession(userId: string, sessionId: string, format: string) {
    const session = await this.assertSession(userId, sessionId);
    const msgs = await this.messages.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });

    const title = session.title || '对话记录';
    const date = session.createdAt.toISOString().split('T')[0];

    if (format === 'md') {
      let md = `# ${title}\n\n`;
      md += `> 导出时间：${new Date().toLocaleString('zh-CN')}\n\n---\n\n`;
      for (const msg of msgs) {
        const role = msg.role === 'user' ? '🧑 你' : '🤖 AI';
        md += `### ${role}\n\n${msg.content}\n\n---\n\n`;
      }
      return { format: 'md', filename: `${title}-${date}.md`, content: md };
    }

    // HTML format for PDF printing
    let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>`;
    html += `<style>body{font-family:system-ui,sans-serif;max-width:700px;margin:2rem auto;padding:0 1rem;color:#1d1d1f;line-height:1.7}`;
    html += `h1{font-size:1.4rem;border-bottom:1px solid #eee;padding-bottom:0.5rem}`;
    html += `.msg{margin:1.5rem 0;padding:1rem;border-radius:8px}`;
    html += `.user{background:#f0f4ff}.assistant{background:#f9fafb;border:1px solid #eee}`;
    html += `.role{font-size:0.85rem;font-weight:600;margin-bottom:0.5rem;color:#555}`;
    html += `.meta{color:#888;font-size:0.8rem;margin-bottom:1.5rem}`;
    html += `pre{background:#f5f5f5;padding:0.8rem;border-radius:4px;overflow-x:auto;font-size:0.85rem}`;
    html += `</style></head><body>`;
    html += `<h1>${title}</h1><p class="meta">导出时间：${new Date().toLocaleString('zh-CN')}</p>`;
    for (const msg of msgs) {
      const cls = msg.role === 'user' ? 'user' : 'assistant';
      const role = msg.role === 'user' ? '🧑 你' : '🤖 AI';
      const content = msg.content.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
      html += `<div class="msg ${cls}"><div class="role">${role}</div><div>${content}</div></div>`;
    }
    html += `</body></html>`;
    return { format: 'html', filename: `${title}-${date}.html`, content: html };
  }
}
