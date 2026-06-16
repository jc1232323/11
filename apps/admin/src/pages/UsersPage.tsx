import { FormEvent, useCallback, useEffect, useState } from 'react';
import { Search, UserPlus, ShieldCheck, X, RefreshCw } from 'lucide-react';
import {
  createAdminUser,
  listAdminUsers,
  PLAN_LABELS,
  type AdminUser,
  type PlanType,
} from '../lib/admin';
import { ApiError } from '../lib/api';

const PLANS: PlanType[] = ['free', 'monthly', 'quarterly', 'yearly'];

function fmtDate(s: string | null) {
  if (!s) return '—';
  const d = new Date(s);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

export function UsersPage() {
  const [data, setData] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const pageSize = 20;

  const load = useCallback(
    async (opts?: { page?: number; search?: string; plan?: string }) => {
      setLoading(true);
      setError('');
      try {
        const res = await listAdminUsers({
          page: opts?.page ?? page,
          pageSize,
          search: opts?.search ?? search,
          plan: opts?.plan ?? planFilter,
        });
        setData(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setPage(res.page);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : '加载失败');
      } finally {
        setLoading(false);
      }
    },
    [page, search, planFilter],
  );

  useEffect(() => {
    load({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    load({ page: 1 });
  }

  function onPlanChange(plan: string) {
    setPlanFilter(plan);
    load({ page: 1, plan });
  }

  return (
    <div className="um">
      <div className="um-head">
        <div>
          <h1 className="um-title">用户管理</h1>
          <p className="um-desc">共 {total} 位用户 · 数据来自数据库</p>
        </div>
        <button className="um-btn-primary" onClick={() => setShowCreate(true)}>
          <UserPlus size={16} /> 添加用户
        </button>
      </div>

      <div className="um-toolbar">
        <form className="um-search" onSubmit={onSearch}>
          <Search size={16} />
          <input
            placeholder="搜索邮箱或昵称"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <select
          className="um-select"
          value={planFilter}
          onChange={(e) => onPlanChange(e.target.value)}
        >
          <option value="all">全部会员等级</option>
          {PLANS.map((p) => (
            <option key={p} value={p}>
              {PLAN_LABELS[p]}
            </option>
          ))}
        </select>
        <button className="um-btn-ghost" onClick={() => load()}>
          <RefreshCw size={15} /> 刷新
        </button>
      </div>

      {error && <div className="um-error">{error}</div>}

      <div className="um-table-wrap">
        <table className="um-table">
          <thead>
            <tr>
              <th>邮箱</th>
              <th>昵称</th>
              <th>会员等级</th>
              <th>到期时间</th>
              <th>角色</th>
              <th>注册时间</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="um-empty">
                  加载中…
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={6} className="um-empty">
                  暂无用户
                </td>
              </tr>
            ) : (
              data.map((u) => (
                <tr key={u.id}>
                  <td>
                    <span className="um-email">{u.email}</span>
                    {!u.emailVerified && (
                      <span className="um-tag um-tag-warn">未验证</span>
                    )}
                  </td>
                  <td>{u.nickname || '—'}</td>
                  <td>
                    <span className={`um-plan um-plan-${u.plan}`}>
                      {PLAN_LABELS[u.plan]}
                    </span>
                    {u.plan !== 'free' && !u.isPremium && (
                      <span className="um-tag um-tag-warn">已过期</span>
                    )}
                  </td>
                  <td>{fmtDate(u.planExpiresAt)}</td>
                  <td>
                    {u.isAdmin ? (
                      <span className="um-tag um-tag-admin">
                        <ShieldCheck size={12} /> 管理员
                      </span>
                    ) : (
                      <span className="um-muted">普通用户</span>
                    )}
                  </td>
                  <td className="um-muted">{fmtDate(u.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="um-pager">
        <span>
          第 {page} / {totalPages} 页
        </span>
        <div className="um-pager-btns">
          <button
            disabled={page <= 1 || loading}
            onClick={() => load({ page: page - 1 })}
          >
            上一页
          </button>
          <button
            disabled={page >= totalPages || loading}
            onClick={() => load({ page: page + 1 })}
          >
            下一页
          </button>
        </div>
      </div>

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            load({ page: 1 });
          }}
        />
      )}

      <style>{usersStyles}</style>
    </div>
  );
}

function CreateUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [plan, setPlan] = useState<PlanType>('free');
  const [isAdmin, setIsAdmin] = useState(false);
  const [planExpiresAt, setPlanExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await createAdminUser({
        email: email.trim(),
        password,
        nickname: nickname.trim() || undefined,
        plan,
        isAdmin,
        planExpiresAt:
          plan !== 'free' && planExpiresAt ? planExpiresAt : undefined,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '创建失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>
        <div className="um-modal-head">
          <h2>添加用户</h2>
          <button className="um-modal-close" onClick={onClose} aria-label="关闭">
            <X size={18} />
          </button>
        </div>
        <form className="um-form" onSubmit={submit}>
          <label className="um-field">
            <span>邮箱 *</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </label>
          <label className="um-field">
            <span>密码 *（至少 8 位）</span>
            <input
              type="text"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="初始密码"
            />
          </label>
          <label className="um-field">
            <span>昵称</span>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="留空则用邮箱前缀"
            />
          </label>
          <label className="um-field">
            <span>会员等级</span>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value as PlanType)}
            >
              {PLANS.map((p) => (
                <option key={p} value={p}>
                  {PLAN_LABELS[p]}
                </option>
              ))}
            </select>
          </label>
          {plan !== 'free' && (
            <label className="um-field">
              <span>到期时间（留空按等级自动计算）</span>
              <input
                type="date"
                value={planExpiresAt}
                onChange={(e) => setPlanExpiresAt(e.target.value)}
              />
            </label>
          )}
          <label className="um-checkbox">
            <input
              type="checkbox"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            <span>设为管理员（可访问后台）</span>
          </label>

          {error && <div className="um-error">{error}</div>}

          <div className="um-modal-actions">
            <button type="button" className="um-btn-ghost" onClick={onClose}>
              取消
            </button>
            <button
              type="submit"
              className="um-btn-primary"
              disabled={submitting}
            >
              {submitting ? '创建中…' : '创建用户'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const usersStyles = `
.um-title { font-size: 1.3rem; font-weight: 700; color: #1f2937; }
.um-desc { color: #6b7280; font-size: 0.85rem; margin-top: 0.25rem; }
.um-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 1rem;
}
.um-btn-primary {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: #4f6ef7; color: #fff;
  border: none; border-radius: 7px;
  padding: 0.55rem 1rem; font-size: 0.88rem;
  cursor: pointer; transition: background 0.18s;
  white-space: nowrap;
}
.um-btn-primary:hover { background: #3b5ce5; }
.um-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.um-btn-ghost {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: #fff; color: #4b5563;
  border: 1px solid #e5e7eb; border-radius: 7px;
  padding: 0.5rem 0.9rem; font-size: 0.85rem; cursor: pointer;
  transition: all 0.18s;
}
.um-btn-ghost:hover { border-color: #4f6ef7; color: #4f6ef7; }

.um-toolbar {
  display: flex; gap: 0.75rem; margin-bottom: 1rem;
  flex-wrap: wrap;
}
.um-search {
  display: flex; align-items: center; gap: 0.5rem;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 7px;
  padding: 0 0.75rem; color: #9ca3af; flex: 1; min-width: 200px;
}
.um-search input {
  border: none; outline: none; background: transparent;
  padding: 0.55rem 0; font-size: 0.88rem; flex: 1; color: #1f2937;
}
.um-select {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 7px;
  padding: 0.5rem 0.75rem; font-size: 0.85rem; color: #1f2937; cursor: pointer;
}

.um-table-wrap {
  background: #fff; border-radius: 10px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  overflow-x: auto;
}
.um-table { width: 100%; border-collapse: collapse; font-size: 0.86rem; }
.um-table th {
  text-align: left; padding: 0.8rem 1rem;
  background: #fafafa; color: #6b7280; font-weight: 600;
  border-bottom: 1px solid #eef0f3; white-space: nowrap;
}
.um-table td {
  padding: 0.8rem 1rem; border-bottom: 1px solid #f3f4f6;
  color: #374151; white-space: nowrap;
}
.um-table tr:last-child td { border-bottom: none; }
.um-table tbody tr:hover { background: #fafbff; }
.um-email { font-weight: 500; color: #1f2937; }
.um-muted { color: #9ca3af; }
.um-empty { text-align: center; color: #9ca3af; padding: 2.5rem !important; }

.um-tag {
  display: inline-flex; align-items: center; gap: 0.2rem;
  font-size: 0.72rem; padding: 0.12rem 0.45rem;
  border-radius: 5px; margin-left: 0.4rem; vertical-align: middle;
}
.um-tag-warn { background: #fef3c7; color: #b45309; }
.um-tag-admin { background: #ede9fe; color: #6d28d9; }
.um-plan {
  font-size: 0.78rem; padding: 0.18rem 0.55rem; border-radius: 5px;
}
.um-plan-free { background: #f1f5f9; color: #64748b; }
.um-plan-monthly { background: #eef2ff; color: #4f6ef7; }
.um-plan-quarterly { background: #ecfdf5; color: #059669; }
.um-plan-yearly { background: #fffbeb; color: #d97706; }

.um-error {
  background: #fef2f2; color: #dc2626; border: 1px solid #fecaca;
  border-radius: 7px; padding: 0.6rem 0.9rem; font-size: 0.85rem;
  margin: 0.75rem 0;
}

.um-pager {
  display: flex; align-items: center; justify-content: space-between;
  margin-top: 1rem; font-size: 0.85rem; color: #6b7280;
}
.um-pager-btns { display: flex; gap: 0.5rem; }
.um-pager-btns button {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 6px;
  padding: 0.4rem 0.9rem; font-size: 0.83rem; cursor: pointer; color: #374151;
}
.um-pager-btns button:disabled { opacity: 0.45; cursor: not-allowed; }
.um-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 100; padding: 1rem;
}
.um-modal {
  background: #fff; border-radius: 12px; width: 100%; max-width: 440px;
  max-height: 90vh; overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
}
.um-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.1rem 1.25rem; border-bottom: 1px solid #f3f4f6;
}
.um-modal-head h2 { font-size: 1.05rem; font-weight: 600; color: #1f2937; }
.um-modal-close {
  border: none; background: transparent; color: #9ca3af; cursor: pointer;
  display: flex; padding: 0.2rem;
}
.um-modal-close:hover { color: #1f2937; }
.um-form { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.9rem; }
.um-field { display: flex; flex-direction: column; gap: 0.35rem; }
.um-field span { font-size: 0.82rem; color: #4b5563; font-weight: 500; }
.um-field input, .um-field select {
  border: 1px solid #e5e7eb; border-radius: 7px;
  padding: 0.55rem 0.7rem; font-size: 0.88rem; color: #1f2937;
  outline: none; transition: border-color 0.18s;
}
.um-field input:focus, .um-field select:focus { border-color: #4f6ef7; }
.um-checkbox {
  display: flex; align-items: center; gap: 0.5rem;
  font-size: 0.85rem; color: #4b5563; cursor: pointer;
}
.um-checkbox input { width: 16px; height: 16px; cursor: pointer; }
.um-modal-actions {
  display: flex; justify-content: flex-end; gap: 0.6rem; margin-top: 0.25rem;
}

@media (max-width: 640px) {
  .um-head { flex-direction: column; }
}
`;


