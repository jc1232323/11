import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RoleSelector } from '../components/RoleSelector';
import { ApiError, api } from '../lib/api';
import { DEFAULT_ROLE, type RoleId } from '../lib/roles';
import { useAuth } from '../context/AuthContext';
import { Settings, User, Lock, Save, CheckCircle2 } from 'lucide-react';

type Profile = {
  email: string;
  nickname: string;
  defaultRole: RoleId;
};

export function SettingsPage() {
  const { user, refresh } = useAuth();
  const [defaultRole, setDefaultRole] = useState<RoleId>(DEFAULT_ROLE);
  const [nickname, setNickname] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<Profile>('/users/me').then((data) => {
      setDefaultRole(data.defaultRole);
      setNickname(data.nickname);
    });
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ nickname, defaultRole }),
      });
      setMsg('个人资料已更新');
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '更新失败');
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await api('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      setOldPassword('');
      setNewPassword('');
      setMsg('密码已修改');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '修改失败');
    }
  }

  return (
    <div className="container settings-page">
      <motion.header
        className="settings-header"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="settings-header-icon">
          <Settings size={24} strokeWidth={1.6} />
        </div>
        <h1>设置</h1>
      </motion.header>

      {msg && (
        <motion.p
          className="settings-success"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle2 size={16} strokeWidth={2} />
          {msg}
        </motion.p>
      )}
      {error && <p className="error-text">{error}</p>}

      <motion.form
        className="card settings-card"
        onSubmit={saveProfile}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="settings-card-head">
          <User size={18} strokeWidth={1.8} />
          <h2>个人资料</h2>
        </div>
        <p className="settings-email">邮箱：{user?.email}</p>
        <div className="settings-field">
          <label className="label">昵称</label>
          <input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </div>
        <div className="settings-field">
          <label className="label">默认 AI 角色</label>
          <RoleSelector value={defaultRole} onChange={setDefaultRole} className="input" />
        </div>
        <button type="submit" className="btn btn-primary">
          <Save size={15} strokeWidth={2} />
          保存资料
        </button>
      </motion.form>

      <motion.form
        className="card settings-card"
        onSubmit={changePassword}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="settings-card-head">
          <Lock size={18} strokeWidth={1.8} />
          <h2>修改密码</h2>
        </div>
        <div className="settings-field">
          <label className="label">旧密码</label>
          <input
            className="input"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>
        <div className="settings-field">
          <label className="label">新密码（至少 8 位）</label>
          <input
            className="input"
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-ghost">
          <Lock size={15} strokeWidth={2} />
          修改密码
        </button>
      </motion.form>

      <style>{`
        .settings-page { max-width: 560px; padding-bottom: 2rem; }
        .settings-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .settings-header-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .settings-header h1 {
          font-size: 1.4rem;
          font-weight: 700;
        }
        .settings-success {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--success);
          font-size: 0.9rem;
          margin-bottom: 1rem;
          padding: 0.6rem 1rem;
          background: rgba(16, 185, 129, 0.06);
          border-radius: var(--radius-sm);
        }
        .settings-card {
          padding: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .settings-card-head {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--text);
        }
        .settings-card-head h2 { font-size: 1.05rem; font-weight: 600; }
        .settings-email {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        .settings-field { margin-bottom: 1rem; }
      `}</style>
    </div>
  );
}
