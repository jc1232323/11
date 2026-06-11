import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from ?? '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate(from);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '登录失败');
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
          <h1>欢迎回来</h1>
          <p>使用邮箱登录后继续学习</p>
        </div>

        <div className="auth-field">
          <label className="auth-label">邮箱</label>
          <div className="auth-input-wrap">
            <Mail size={16} strokeWidth={1.8} className="auth-input-icon" />
            <input
              className="auth-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              placeholder="输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="btn btn-primary auth-submit" disabled={loading}>
          {loading ? (
            <span className="auth-loading">登录中...</span>
          ) : (
            <>
              <LogIn size={16} strokeWidth={2} />
              登录
            </>
          )}
        </button>

        <p className="auth-footer">
          没有账号？<Link to="/register">注册</Link>
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
        .auth-header {
          margin-bottom: 2rem;
        }
        .auth-header h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.35rem;
        }
        .auth-header p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .auth-field {
          margin-bottom: 1.25rem;
        }
        .auth-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
        }
        .auth-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
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
        .auth-footer a {
          color: var(--primary);
          font-weight: 500;
        }
        .auth-footer a:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}
