import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  api,
  streamChat,
  type ChatMessage,
  type ChatSession,
  type KnowledgeTree,
} from '../lib/api';
import { ChatMessageContent } from './ChatMessageContent';
import { RoleSelector } from './RoleSelector';
import {
  buildKnowledgeAskDisplay,
  buildKnowledgeAskMessage,
  type KnowledgeAskState,
} from '../lib/knowledge-ask';
import { DEFAULT_ROLE, getRoleMeta, type RoleId } from '../lib/roles';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Send,
  Trash2,
  BookOpen,
  GraduationCap,
  Loader2,
  MessageSquare,
  Sparkles,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

type AskMode = 'explain' | 'practice' | 'free';

export function ChatWorkspace() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [roleMode, setRoleMode] = useState<RoleId>(DEFAULT_ROLE);
  const [streaming, setStreaming] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState('');
  const [lastSentContent, setLastSentContent] = useState('');
  const [knowledgeTree, setKnowledgeTree] = useState<KnowledgeTree>([]);
  const [knowledgeSlug, setKnowledgeSlug] = useState('');
  const [askMode, setAskMode] = useState<AskMode>('free');
  const messagesRef = useRef<HTMLDivElement>(null);
  const pendingAskRef = useRef<KnowledgeAskState | null>(
    (location.state as { knowledgeAsk?: KnowledgeAskState } | null)
      ?.knowledgeAsk ?? null,
  );
  const autoAskDoneRef = useRef(false);

  useEffect(() => {
    api<KnowledgeTree>('/knowledge/tree')
      .then(setKnowledgeTree)
      .catch(() => setKnowledgeTree([]));
  }, []);

  const ensureSession = useCallback(async (): Promise<string | null> => {
    const list = await api<ChatSession[]>('/chat/sessions');
    setSessions(list);
    if (list.length > 0) {
      const id = list[0].id;
      setActiveId(id);
      setRoleMode(list[0].roleMode);
      return id;
    }
    if (!user) return null;
    const session = await api<ChatSession>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ roleMode: user.defaultRole ?? DEFAULT_ROLE }),
    });
    setSessions([session]);
    setActiveId(session.id);
    setRoleMode(session.roleMode);
    return session.id;
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setInitializing(true);
      setError('');
      try {
        await ensureSession();
      } catch {
        if (!cancelled) setError('加载对话失败，请刷新页面');
      } finally {
        if (!cancelled) setInitializing(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ensureSession]);

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    api<ChatMessage[]>(`/chat/sessions/${activeId}/messages`)
      .then((msgs) => { if (!cancelled) setMessages(msgs); })
      .catch(() => { if (!cancelled) setMessages([]); });
    return () => { cancelled = true; };
  }, [activeId]);

  useEffect(() => {
    const session = sessions.find((s) => s.id === activeId);
    if (session) setRoleMode(getRoleMeta(session.roleMode)?.id ?? DEFAULT_ROLE);
  }, [activeId, sessions]);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    if (streaming) {
      el.scrollTop = el.scrollHeight;
    } else {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, streaming]);

  const sendMessage = useCallback(
    async (
      content: string,
      sessionId: string,
      options?: {
        bubblePreview?: string;
        knowledgeSlug?: string;
        askMode?: AskMode;
      },
    ) => {
      if (!content.trim() || streaming) return;
      setError('');
      setStreaming(true);
      setLastSentContent(content.trim());

      const slug = options?.knowledgeSlug ?? (knowledgeSlug || undefined);
      const mode = options?.askMode ?? (slug ? askMode : 'free');

      const tempUser: ChatMessage = {
        id: `tmp-u-${Date.now()}`,
        role: 'user',
        content: (options?.bubblePreview ?? content).trim(),
        createdAt: new Date().toISOString(),
      };
      const tempAssistant: ChatMessage = {
        id: `tmp-a-${Date.now()}`,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, tempUser, tempAssistant]);

      try {
        await streamChat(
          sessionId,
          content.trim(),
          roleMode,
          (delta) => {
            setMessages((prev) => {
              const copy = [...prev];
              const last = copy[copy.length - 1];
              if (last?.role === 'assistant') {
                copy[copy.length - 1] = { ...last, content: last.content + delta };
              }
              return copy;
            });
          },
          (errMsg) => setError(errMsg),
          { displayContent: options?.bubblePreview, knowledgeSlug: slug, askMode: mode },
        );
        const fresh = await api<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
        setMessages(fresh);
        const list = await api<ChatSession[]>('/chat/sessions');
        setSessions(list);
      } catch (err) {
        setError(err instanceof Error ? err.message : '发送失败');
        setMessages((prev) => prev.filter((m) => !m.id.startsWith('tmp-')));
      } finally {
        setStreaming(false);
      }
    },
    [streaming, roleMode, knowledgeSlug, askMode],
  );

  useEffect(() => {
    const ask = pendingAskRef.current;
    if (!ask || !activeId || initializing || autoAskDoneRef.current) return;
    autoAskDoneRef.current = true;
    pendingAskRef.current = null;
    navigate('/', { replace: true, state: {} });
    setKnowledgeSlug(ask.slug);
    setAskMode(ask.mode);
    (async () => {
      const session = await api<ChatSession>('/chat/sessions', {
        method: 'POST',
        body: JSON.stringify({
          title: `${ask.mode === 'practice' ? '练习' : '讲解'}：${ask.title}`,
          roleMode: user?.defaultRole ?? DEFAULT_ROLE,
        }),
      });
      setSessions((prev) => [session, ...prev]);
      setActiveId(session.id);
      setRoleMode(session.roleMode);
      setMessages([]);
      const prompt = buildKnowledgeAskMessage(ask);
      const preview = buildKnowledgeAskDisplay(ask);
      await sendMessage(prompt, session.id, {
        bubblePreview: preview,
        knowledgeSlug: ask.slug,
        askMode: ask.mode,
      });
    })();
  }, [activeId, initializing, navigate, sendMessage, user?.defaultRole]);

  async function newSession() {
    const session = await api<ChatSession>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ roleMode: user?.defaultRole ?? DEFAULT_ROLE }),
    });
    setSessions((prev) => [session, ...prev]);
    setActiveId(session.id);
    setMessages([]);
    setRoleMode(session.roleMode);
  }

  async function deleteSession(id: string) {
    await api(`/chat/sessions/${id}`, { method: 'DELETE' });
    const next = sessions.filter((s) => s.id !== id);
    setSessions(next);
    if (activeId === id) {
      const newActive = next[0]?.id ?? null;
      setActiveId(newActive);
      if (!newActive) {
        setMessages([]);
        const newId = await ensureSession();
        if (newId) {
          const msgs = await api<ChatMessage[]>(`/chat/sessions/${newId}/messages`);
          setMessages(msgs);
        }
      }
    }
  }

  async function submitCurrentInput() {
    if (!input.trim() || streaming) return;
    let sessionId = activeId;
    if (!sessionId) {
      sessionId = await ensureSession();
      if (!sessionId) return;
    }
    const content = input.trim();
    setInput('');
    await sendMessage(content, sessionId);
  }

  async function onSend(e: FormEvent) {
    e.preventDefault();
    await submitCurrentInput();
  }

  async function triggerKnowledgeMode(mode: 'explain' | 'practice') {
    if (!knowledgeSlug || streaming) return;
    setAskMode(mode);
    let sessionId = activeId;
    if (!sessionId) {
      sessionId = await ensureSession();
      if (!sessionId) return;
    }
    const topic = knowledgeTree
      .flatMap((m) => m.chapters)
      .flatMap((c) => c.topics)
      .find((t) => t.slug === knowledgeSlug);
    const title = topic?.title ?? '知识点';
    const prompt =
      mode === 'practice'
        ? `请根据知识点「${title}」出练习题`
        : `请讲解知识点「${title}」`;
    const preview =
      mode === 'practice'
        ? `出题练习：**${title}**`
        : `学习讲解：**${title}**`;
    await sendMessage(prompt, sessionId, {
      bubblePreview: preview,
      knowledgeSlug,
      askMode: mode,
    });
  }

  const inputDisabled = initializing || streaming;

  return (
    <div className="cw">
      <div className="cw-layout">
        {/* Sessions sidebar */}
        <aside className="cw-sessions">
          <div className="cw-sessions-head">
            <h2>对话</h2>
            <button
              type="button"
              className="cw-new-btn"
              onClick={newSession}
              disabled={initializing}
              title="新建对话"
            >
              <Plus size={16} strokeWidth={2} />
            </button>
          </div>
          <ul className="cw-sessions-list">
            <AnimatePresence initial={false}>
              {sessions.map((s) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <button
                    type="button"
                    className={`cw-session ${s.id === activeId ? 'active' : ''}`}
                    onClick={() => setActiveId(s.id)}
                  >
                    <MessageSquare size={14} strokeWidth={1.6} />
                    <span className="cw-session-title">{s.title}</span>
                  </button>
                  <button
                    type="button"
                    className="cw-delete-btn"
                    onClick={() => deleteSession(s.id)}
                    aria-label="删除"
                  >
                    <Trash2 size={13} strokeWidth={1.6} />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </aside>

        {/* Chat panel */}
        <section className="cw-chat">
          {/* Toolbar */}
          <div className="cw-toolbar">
            <div className="cw-toolbar-item">
              <span className="cw-toolbar-label">AI 角色</span>
              <RoleSelector
                value={roleMode}
                onChange={setRoleMode}
                disabled={streaming}
                className="cw-select"
                showHint={false}
              />
            </div>
            <div className="cw-toolbar-item">
              <span className="cw-toolbar-label">知识点</span>
              <select
                value={knowledgeSlug}
                onChange={(e) => setKnowledgeSlug(e.target.value)}
                disabled={streaming}
                className="cw-select"
              >
                <option value="">不关联知识点</option>
                {knowledgeTree.map((mod) =>
                  mod.chapters.map((chapter) => (
                    <optgroup
                      key={`${mod.slug}-${chapter.slug}`}
                      label={`${mod.title} · ${chapter.title}`}
                    >
                      {chapter.topics.map((topic) => (
                        <option key={topic.slug} value={topic.slug}>
                          {topic.title}
                        </option>
                      ))}
                    </optgroup>
                  )),
                )}
              </select>
            </div>
            {knowledgeSlug && (
              <div className="cw-mode-btns">
                <button
                  type="button"
                  className={`cw-mode-btn ${askMode === 'explain' ? 'active' : ''}`}
                  onClick={() => void triggerKnowledgeMode('explain')}
                  disabled={streaming}
                >
                  <BookOpen size={14} strokeWidth={1.8} />
                  讲解
                </button>
                <button
                  type="button"
                  className={`cw-mode-btn ${askMode === 'practice' ? 'active' : ''}`}
                  onClick={() => void triggerKnowledgeMode('practice')}
                  disabled={streaming}
                >
                  <GraduationCap size={14} strokeWidth={1.8} />
                  练习
                </button>
              </div>
            )}
          </div>

          {/* Messages */}
          <div className="cw-messages" ref={messagesRef}>
            {initializing && (
              <div className="cw-empty">
                <Loader2 size={24} className="cw-spinner" />
                <p>正在准备对话...</p>
              </div>
            )}
            {!initializing && messages.length === 0 && (
              <div className="cw-empty">
                <Sparkles size={32} strokeWidth={1.4} className="cw-empty-icon" />
                <p className="cw-empty-title">开始你的化学之旅</p>
                <p className="cw-empty-desc">输入问题，或选择知识点开始讲解与练习</p>
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((m, index) => {
                const isLast = index === messages.length - 1;
                const isStreamingAssistant = streaming && isLast && m.role === 'assistant';
                return (
                  <motion.div
                    key={m.id}
                    className={`cw-bubble ${m.role}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="cw-bubble-avatar">
                      {m.role === 'user' ? '你' : 'AI'}
                    </div>
                    <div className="cw-bubble-content">
                      <ChatMessageContent
                        content={m.content}
                        streaming={isStreamingAssistant}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Error with retry */}
          {error && (
            <div className="cw-error-bar">
              <AlertTriangle size={16} strokeWidth={2} />
              <span className="cw-error-text">{error}</span>
              {lastSentContent && !streaming && (
                <button
                  type="button"
                  className="cw-retry-btn"
                  onClick={() => {
                    if (activeId) {
                      setError('');
                      void sendMessage(lastSentContent, activeId);
                    }
                  }}
                >
                  <RefreshCw size={14} strokeWidth={2} />
                  重试
                </button>
              )}
            </div>
          )}

          {/* Composer */}
          <form className="cw-composer" onSubmit={onSend}>
            <textarea
              className="cw-input"
              rows={1}
              placeholder={
                initializing
                  ? '正在加载...'
                  : '输入你的化学问题... (Enter 发送)'
              }
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!inputDisabled && input.trim()) {
                    void submitCurrentInput();
                  }
                }
              }}
              disabled={inputDisabled}
            />
            <button
              type="submit"
              className="cw-send-btn"
              disabled={inputDisabled || !input.trim()}
            >
              {streaming ? (
                <Loader2 size={18} className="cw-spinner" />
              ) : (
                <Send size={18} strokeWidth={2} />
              )}
            </button>
          </form>
        </section>
      </div>

      <style>{`
        .cw {
          height: calc(100vh - 80px);
          min-height: 480px;
          max-height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .cw-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 0;
          flex: 1;
          min-height: 0;
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          box-shadow: var(--shadow);
        }
        @media (max-width: 768px) {
          .cw-layout { grid-template-columns: 1fr; }
          .cw-sessions { max-height: 130px; border-right: none; border-bottom: 1px solid var(--border-light); }
          .cw-toolbar { flex-direction: column; align-items: stretch; }
        }

        /* Sessions panel */
        .cw-sessions {
          padding: 1rem 0.75rem;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 0;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--border-light);
        }
        .cw-sessions-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding: 0 0.25rem;
          flex-shrink: 0;
        }
        .cw-sessions-head h2 {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .cw-new-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all var(--duration) var(--ease);
        }
        .cw-new-btn:hover:not(:disabled) {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-muted);
        }
        .cw-sessions-list {
          list-style: none;
          overflow-y: auto;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .cw-sessions-list li {
          display: flex;
          align-items: center;
          gap: 0;
        }
        .cw-session {
          flex: 1;
          text-align: left;
          padding: 0.5rem 0.6rem;
          border: none;
          background: transparent;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-size: 0.85rem;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all var(--duration) var(--ease);
          overflow: hidden;
        }
        .cw-session-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cw-session:hover {
          background: var(--primary-light);
          color: var(--primary);
        }
        .cw-session.active {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 500;
        }
        .cw-delete-btn {
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.35rem;
          border-radius: 6px;
          opacity: 0;
          transition: all var(--duration) var(--ease);
          display: flex;
          align-items: center;
        }
        .cw-sessions-list li:hover .cw-delete-btn {
          opacity: 1;
        }
        .cw-delete-btn:hover {
          color: var(--danger);
          background: rgba(239, 68, 68, 0.08);
        }

        /* Chat panel */
        .cw-chat {
          display: flex;
          flex-direction: column;
          min-height: 0;
          flex: 1;
          overflow: hidden;
        }

        /* Toolbar */
        .cw-toolbar {
          padding: 0.75rem 1.25rem;
          border-bottom: 1px solid var(--border-light);
          font-size: 0.85rem;
          flex-shrink: 0;
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: flex-end;
          background: var(--bg-elevated);
        }
        .cw-toolbar-item {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .cw-toolbar-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .cw-select {
          height: 34px;
          padding: 0 0.7rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          font-size: 0.85rem;
          background: var(--bg-elevated);
          color: var(--text);
          cursor: pointer;
          min-width: 140px;
          transition: border-color var(--duration) var(--ease);
        }
        .cw-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }
        .cw-mode-btns { display: flex; gap: 0.35rem; }
        .cw-mode-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem 0.7rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          font-size: 0.8rem;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all var(--duration) var(--ease);
        }
        .cw-mode-btn:hover:not(:disabled) {
          border-color: var(--primary);
          color: var(--primary);
        }
        .cw-mode-btn.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }

        /* Messages area */
        .cw-messages {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          overscroll-behavior: contain;
          padding: 1.5rem 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background: var(--bg);
        }
        .cw-empty {
          margin: auto;
          text-align: center;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
        }
        .cw-empty-icon { color: var(--primary); opacity: 0.5; }
        .cw-empty-title {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .cw-empty-desc { font-size: 0.9rem; }
        .cw-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Bubbles */
        .cw-bubble {
          display: flex;
          gap: 0.75rem;
          max-width: 80%;
          animation: fadeInUp 0.3s var(--ease) both;
        }
        .cw-bubble.user { align-self: flex-end; flex-direction: row-reverse; }
        .cw-bubble.assistant { align-self: flex-start; }
        .cw-bubble-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          flex-shrink: 0;
        }
        .cw-bubble.user .cw-bubble-avatar {
          background: var(--primary);
          color: #fff;
        }
        .cw-bubble.assistant .cw-bubble-avatar {
          background: var(--primary-light);
          color: var(--primary);
        }
        .cw-bubble-content {
          padding: 0.75rem 1rem;
          border-radius: var(--radius);
          word-break: break-word;
          overflow-x: auto;
          line-height: 1.65;
          font-size: 0.92rem;
        }
        .cw-bubble.assistant .cw-bubble-content {
          background: var(--bg-elevated);
          border: 1px solid var(--border-light);
          box-shadow: var(--shadow-sm);
        }
        .cw-bubble.user .cw-bubble-content {
          background: var(--primary);
          color: #fff;
          border: none;
        }

        /* Error */
        .cw-error-bar {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--danger);
          font-size: 0.85rem;
          padding: 0.6rem 1.25rem;
          margin: 0;
          background: rgba(239, 68, 68, 0.05);
          border-top: 1px solid rgba(239, 68, 68, 0.12);
        }
        .cw-error-text { flex: 1; }
        .cw-retry-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.35rem 0.7rem;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(239, 68, 68, 0.25);
          background: rgba(239, 68, 68, 0.08);
          color: var(--danger);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--duration) var(--ease);
        }
        .cw-retry-btn:hover {
          background: rgba(239, 68, 68, 0.14);
          border-color: rgba(239, 68, 68, 0.4);
        }

        /* Composer */
        .cw-composer {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid var(--border-light);
          align-items: flex-end;
          flex-shrink: 0;
          background: var(--bg-elevated);
        }
        .cw-input {
          flex: 1;
          resize: none;
          min-height: 42px;
          max-height: 120px;
          padding: 0.6rem 1rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          background: var(--bg);
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--text);
          transition: border-color var(--duration) var(--ease), box-shadow var(--duration) var(--ease);
        }
        .cw-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
          background: var(--bg-elevated);
        }
        .cw-send-btn {
          width: 42px;
          height: 42px;
          border-radius: var(--radius);
          border: none;
          background: var(--primary);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--duration) var(--ease);
          flex-shrink: 0;
        }
        .cw-send-btn:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: scale(1.05);
        }
        .cw-send-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}
