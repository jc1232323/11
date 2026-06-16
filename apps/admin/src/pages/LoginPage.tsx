import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '登录失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="login-logo">
          <ShieldCheck size={30} strokeWidth={2} />
        </div>
        <h1>学小问 · 管理后台</h1>
        <p className="login-sub">请使用管理员账号登录</p>

        <label className="login-field">
          <Mail size={16} />
          <input
            type="email"
            required
            placeholder="管理员邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="login-field">
          <Lock size={16} />
          <input
            type="password"
            required
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>

        {error && <div className="login-error">{error}</div>}

        <button type="submit" className="login-btn" disabled={submitting}>
          {submitting ? '登录中…' : '登录'}
        </button>
      </form>

      <style>{`
        .login {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #001529 0%, #1a2744 100%);
          padding: 1rem;
        }
        .login-card {
          width: 100%;
          max-width: 380px;
          background: #fff;
          border-radius: 14px;
          padding: 2.25rem 2rem;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .login-logo {
          width: 60px; height: 60px;
          border-radius: 16px;
          background: #eef2ff;
          color: #4f6ef7;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1rem;
        }
        .login-card h1 { font-size: 1.2rem; font-weight: 700; color: #1f2937; }
        .login-sub { color: #9ca3af; font-size: 0.85rem; margin: 0.4rem 0 1.5rem; }
        .login-field {
          width: 100%;
          display: flex; align-items: center; gap: 0.6rem;
          border: 1px solid #e5e7eb;
          border-radius: 9px;
          padding: 0 0.85rem;
          margin-bottom: 0.85rem;
          color: #9ca3af;
          transition: border-color 0.18s;
        }
        .login-field:focus-within { border-color: #4f6ef7; }
        .login-field input {
          flex: 1; border: none; outline: none; background: transparent;
          padding: 0.7rem 0; font-size: 0.92rem; color: #1f2937;
        }
        .login-error {
          width: 100%;
          background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
          border-radius: 8px; padding: 0.6rem 0.85rem; font-size: 0.85rem;
          margin-bottom: 0.85rem;
        }
        .login-btn {
          width: 100%;
          background: #4f6ef7; color: #fff;
          border: none; border-radius: 9px;
          padding: 0.75rem; font-size: 0.95rem; font-weight: 600;
          cursor: pointer; transition: background 0.18s;
          margin-top: 0.25rem;
        }
        .login-btn:hover { background: #3b5ce5; }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
