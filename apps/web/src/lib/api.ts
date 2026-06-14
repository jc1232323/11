const API_BASE = '/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      (data as { message?: string | string[] }).message ??
      '请求失败';
    const text = Array.isArray(msg) ? msg.join('，') : String(msg);
    throw new ApiError(text, res.status);
  }
  return data as T;
}

import type { RoleId } from './roles';

export type User = {
  id: string;
  email: string;
  nickname: string;
  defaultRole: RoleId;
  emailVerified: boolean;
  plan: 'free' | 'monthly' | 'quarterly' | 'yearly';
  planExpiresAt: string | null;
};

export type KnowledgeTopic = {
  id: string;
  slug: string;
  title: string;
  type: string;
};

export type KnowledgeChapter = {
  id: string;
  slug: string;
  title: string;
  type: string;
  topics: KnowledgeTopic[];
};

export type KnowledgeModule = {
  id: string;
  slug: string;
  title: string;
  type: string;
  chapters: KnowledgeChapter[];
};

export type KnowledgeTree = KnowledgeModule[];

export type KnowledgeDetail = {
  id: string;
  slug: string;
  title: string;
  chapterTitle: string | null;
  moduleTitle: string | null;
  mdBody: string;
  prev: { slug: string; title: string } | null;
  next: { slug: string; title: string } | null;
};

export type ChatSession = {
  id: string;
  title: string;
  roleMode: RoleId;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};

import { formatLlmError } from './llm-error';

export type StreamChatOptions = {
  displayContent?: string;
  knowledgeSlug?: string;
  askMode?: 'explain' | 'practice' | 'free';
};

export async function streamChat(
  sessionId: string,
  content: string,
  roleMode: RoleId | undefined,
  onDelta: (text: string) => void,
  onError: (msg: string) => void,
  options?: StreamChatOptions,
): Promise<void> {
  const res = await fetch(`/api/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content,
      roleMode,
      ...(options?.displayContent ? { displayContent: options.displayContent } : {}),
      ...(options?.knowledgeSlug ? { knowledgeSlug: options.knowledgeSlug } : {}),
      ...(options?.askMode ? { askMode: options.askMode } : {}),
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = (data as { message?: string }).message ?? '发送失败';
    throw new Error(Array.isArray(msg) ? msg.join('，') : String(msg));
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('无法读取响应流');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      const line = part.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      const data = line.slice(6);
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data) as {
          content?: string;
          error?: string;
        };
        if (parsed.error) onError(formatLlmError(parsed.error));
        if (parsed.content) onDelta(parsed.content);
      } catch {
        /* ignore */
      }
    }
  }
}
