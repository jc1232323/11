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

    try {
      const upstream = await fetch(`${llm.apiBase}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${llm.apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(120000),
      });

      if (!upstream.ok || !upstream.body) {
        const errText = await upstream.text().catch(() => '上游模型请求失败');
        const friendly = formatLlmError(errText);
        res.write(`data: ${JSON.stringify({ error: friendly })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
        return;
      }

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
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }
}
