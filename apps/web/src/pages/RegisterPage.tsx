import { FormEvent, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, ShieldCheck } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  async function sendCode() {
    if (!email || codeSending || countdown > 0) return;
    setError('');
    setCodeSending(true);
    try {
      await api<{ message: string }>('/auth/send-code', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setCodeSent(true);
      setCountdown(60);
      timerRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '发送验证码失败');
    } finally {
      setCodeSending(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError('请输入验证码');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(email, password, code.trim(), nickname || undefined);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <motion.form
        className="auth-card"
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="auth-header">
          <h1>创建账号</h1>
          <p>邮箱注册，需验证邮箱确保安全</p>
        </div>

        <div className="auth-field">
          <label className="auth-label">邮箱</label>
          <div className="auth-input-wrap">
            <Mail size={16} strokeWidth={1.8} className="auth-input-icon" />
            <input
              className="auth-input reg-email-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="button"
              className="reg-send-code-btn"
              onClick={sendCode}
              disabled={!email || codeSending || countdown > 0}
            >
              {codeSending
                ? '发送中...'
                : countdown > 0
                  ? `${countdown}s`
                  : codeSent
                    ? '重新发送'
                    : '发送验证码'}
            </button>
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label">验证码</label>
          <div className="auth-input-wrap">
            <ShieldCheck size={16} strokeWidth={1.8} className="auth-input-icon" />
            <input
              className="auth-input"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="输入 6 位验证码"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label">昵称（可选）</label>
          <div className="auth-input-wrap">
            <User size={16} strokeWidth={1.8} className="auth-input-icon" />
            <input
              className="auth-input"
              placeholder="你的昵称"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>
        </div>

        <div className="auth-field">
          <label className="auth-label">密码</label>
          <div className="auth-input-wrap">
            <Lock size={16} strokeWidth={1.8} className="auth-input-icon" />
            <input
              className="auth-input"
              type="password"
              placeholder="至少 8 位"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="btn btn-primary auth-submit" disabled={loading || !codeSent}>
          {loading ? (
            <span className="auth-loading">注册中...</span>
          ) : (
            <>
              <UserPlus size={16} strokeWidth={2} />
              注册
            </>
          )}
        </button>

        <p className="auth-footer">
          已有账号？<Link to="/login">登录</Link>
        </p>
      </motion.form>

      <style>{`
        .auth-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 200px);
          padding: 2rem 1rem;
        }
        .auth-card {
          width: min(420px, 100%);
          padding: 2.5rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
        }
        .auth-header { margin-bottom: 2rem; }
        .auth-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.35rem;
        }
        .auth-header p { color: var(--text-muted); font-size: 0.9rem; }
        .auth-field { margin-bottom: 1.25rem; }
        .auth-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
        }
        .auth-input-wrap { position: relative; display: flex; align-items: center; }
        .auth-input-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .auth-input {
          width: 100%;
          padding: 0.7rem 1rem 0.7rem 2.5rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          background: var(--bg);
          font-size: 0.9rem;
          color: var(--text);
          transition: border-color var(--duration) var(--ease), box-shadow var(--duration) var(--ease);
        }
        .auth-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
          background: var(--bg-elevated);
        }
        .auth-input::placeholder { color: var(--text-muted); }
        .reg-email-input {
          padding-right: 7rem;
        }
        .reg-send-code-btn {
          position: absolute;
          right: 4px;
          padding: 0.4rem 0.7rem;
          border-radius: var(--radius-sm);
          border: none;
          background: var(--primary);
          color: #fff;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--duration) var(--ease);
        }
        .reg-send-code-btn:hover:not(:disabled) {
          background: var(--primary-hover);
        }
        .reg-send-code-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .auth-error {
          color: var(--danger);
          font-size: 0.85rem;
          margin-bottom: 1rem;
          padding: 0.5rem 0.75rem;
          background: rgba(239, 68, 68, 0.06);
          border-radius: var(--radius-sm);
        }
        .auth-submit {
          width: 100%;
          margin-top: 0.5rem;
          padding: 0.75rem;
          font-size: 0.95rem;
        }
        .auth-loading { opacity: 0.7; }
        .auth-footer {
          margin-top: 1.5rem;
          text-align: center;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .auth-footer a { color: var(--primary); font-weight: 500; }
        .auth-footer a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
