import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Response } from 'express';
import { Repository } from 'typeorm';
import { formatLlmError } from '../common/llm-error';
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

    const userMsg = this.messages.create({
      sessionId,
      role: 'user',
      content: displayContent,
    });
    await this.messages.save(userMsg);

    const history = await this.messages.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });

    const llm = this.llm.getConfig();
    const systemPrompt = getRolePrompt(roleMode);

    const chatMessages = history
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({ role: m.role, content: m.content }));

    if (dto.displayContent && chatMessages.length > 0) {
      const last = chatMessages[chatMessages.length - 1];
      if (last.role === 'user') last.content = llmContent;
    }

    const payload = {
      model: llm.modelName,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...chatMessages,
      ],
    };

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

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
        const errText = await response.text().catch(() => '上游模型请求失败');
        const friendly = formatLlmError(errText);
        res.write(`data: ${JSON.stringify({ error: friendly })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      } catch (e) {
        const msg = e instanceof Error ? e.message : '网络请求失败';
        if (attempt < MAX_RETRIES) {
          lastError = msg;
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }
        // Final attempt failed
        const friendly = msg.includes('timeout')
          ? 'AI 响应超时，服务器可能繁忙，请稍后重试'
          : `连接 AI 服务失败（已重试 ${MAX_RETRIES} 次）：${msg}`;
        res.write(`data: ${JSON.stringify({ error: friendly })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }
    }

    if (!upstream || !upstream.body) {
      const friendly = lastError
        ? `AI 服务暂时不可用（已重试 ${MAX_RETRIES} 次）：${formatLlmError(lastError)}`
        : 'AI 服务暂时不可用，请稍后重试';
      res.write(`data: ${JSON.stringify({ error: friendly })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

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
