import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, ApiError } from '../lib/api';
import { ArrowLeft, Mail, Send } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await api<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess(res.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '请求失败，请稍后重试');
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
          <h1>忘记密码</h1>
          <p>输入注册时使用的邮箱，我们将发送重置链接</p>
        </div>

        {success ? (
          <div className="fp-success">
            <div className="fp-success-icon">✉️</div>
            <p className="fp-success-text">{success}</p>
            <p className="fp-success-hint">请检查收件箱（含垃圾邮件文件夹）</p>
          </div>
        ) : (
          <>
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

            {error && <p className="auth-error">{error}</p>}

            <button className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <span className="auth-loading">发送中...</span>
              ) : (
                <>
                  <Send size={16} strokeWidth={2} />
                  发送重置链接
                </>
              )}
            </button>
          </>
        )}

        <p className="auth-footer">
          <Link to="/login" className="fp-back-link">
            <ArrowLeft size={14} strokeWidth={2} />
            返回登录
          </Link>
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
        .fp-back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }
        .fp-success {
          text-align: center;
          padding: 1.5rem 0;
        }
        .fp-success-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .fp-success-text {
          color: var(--text);
          font-size: 0.95rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }
        .fp-success-hint {
          color: var(--text-muted);
          font-size: 0.85rem;
        }
      `}</style>
    </div>
  );
}
