import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, ApiError } from '../lib/api';
import { Lock, CheckCircle } from 'lucide-react';

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('两次输入的密码不一致');
      return;
    }
    if (!token) {
      setError('重置链接无效，请重新申请');
      return;
    }
    setLoading(true);
    try {
      await api<{ message: string }>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '重置失败，请稍后重试');
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
          <h1>重置密码</h1>
          <p>输入你的新密码</p>
        </div>

        {success ? (
          <div className="rp-success">
            <CheckCircle size={48} strokeWidth={1.4} className="rp-success-icon" />
            <p className="rp-success-text">密码重置成功！</p>
            <Link to="/login" className="btn btn-primary rp-login-btn">
              前往登录
            </Link>
          </div>
        ) : (
          <>
            <div className="auth-field">
              <label className="auth-label">新密码</label>
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

            <div className="auth-field">
              <label className="auth-label">确认新密码</label>
              <div className="auth-input-wrap">
                <Lock size={16} strokeWidth={1.8} className="auth-input-icon" />
                <input
                  className="auth-input"
                  type="password"
                  placeholder="再次输入新密码"
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <button className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (
                <span className="auth-loading">重置中...</span>
              ) : (
                '设置新密码'
              )}
            </button>
          </>
        )}
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
        .rp-success {
          text-align: center;
          padding: 1.5rem 0;
        }
        .rp-success-icon {
          color: #10b981;
          margin-bottom: 1rem;
        }
        .rp-success-text {
          color: var(--text);
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        .rp-login-btn {
          display: inline-block;
          padding: 0.65rem 1.5rem;
          font-size: 0.9rem;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
