import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, ApiError } from '../lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('验证链接无效');
      return;
    }
    api<{ success: boolean; message: string }>(`/auth/verify-email?token=${token}`)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err instanceof ApiError ? err.message : '验证失败，请稍后重试');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card ve-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {status === 'loading' && (
          <div className="ve-status">
            <Loader2 size={48} strokeWidth={1.4} className="ve-spinner" />
            <p>正在验证...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="ve-status">
            <CheckCircle size={48} strokeWidth={1.4} className="ve-icon-success" />
            <h2>验证成功</h2>
            <p className="ve-message">{message}</p>
            <Link to="/" className="btn btn-primary ve-btn">
              开始使用
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="ve-status">
            <XCircle size={48} strokeWidth={1.4} className="ve-icon-error" />
            <h2>验证失败</h2>
            <p className="ve-message">{message}</p>
            <Link to="/" className="btn btn-primary ve-btn">
              返回首页
            </Link>
          </div>
        )}
      </motion.div>

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
        .ve-card { text-align: center; }
        .ve-status {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0;
        }
        .ve-status h2 {
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text);
        }
        .ve-message {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .ve-icon-success { color: #10b981; }
        .ve-icon-error { color: #ef4444; }
        .ve-spinner {
          color: var(--primary);
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ve-btn {
          margin-top: 1rem;
          display: inline-block;
          padding: 0.65rem 1.5rem;
          font-size: 0.9rem;
          text-decoration: none;
        }
      `}</style>
    </div>
  );
}
