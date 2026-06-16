import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

const NAV = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard, end: true },
  { to: '/users', label: '用户管理', icon: Users, end: false },
];

function crumbFor(pathname: string): string {
  if (pathname.startsWith('/users')) return '用户管理';
  return '仪表盘';
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div className="vben">
      <div
        className={`vben-overlay ${open ? 'show' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside className={`vben-sider ${open ? 'open' : ''}`}>
        <div className="vben-logo">
          <ShieldCheck size={22} strokeWidth={2} />
          <span>学小问 · 后台</span>
        </div>
        <nav className="vben-menu">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  isActive ? 'vben-menu-item active' : 'vben-menu-item'
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="vben-body">
        <header className="vben-header">
          <button
            type="button"
            className="vben-menu-btn"
            onClick={() => setOpen(true)}
            aria-label="菜单"
          >
            <Menu size={20} />
          </button>
          <div className="vben-breadcrumb">
            <span>首页</span>
            <ChevronRight size={14} />
            <span className="current">{crumbFor(location.pathname)}</span>
          </div>
          <div className="vben-header-right">
            <span className="vben-user">{user?.nickname || user?.email}</span>
            <button type="button" className="vben-logout" onClick={() => logout()}>
              <LogOut size={15} strokeWidth={1.8} />
              退出
            </button>
          </div>
        </header>

        <main className="vben-content">
          <Outlet />
        </main>
      </div>

      <style>{adminStyles}</style>
    </div>
  );
}

const adminStyles = `
.vben { display: flex; min-height: 100vh; background: var(--vben-bg); color: var(--vben-text); }
.vben-sider {
  width: 220px;
  background: var(--vben-sider);
  display: flex;
  flex-direction: column;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
}
.vben-logo {
  height: 56px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.1rem;
  color: #fff;
  font-weight: 700;
  font-size: 0.98rem;
  background: var(--vben-sider-2);
  white-space: nowrap;
}
.vben-logo svg { color: var(--vben-primary); flex-shrink: 0; }
.vben-menu { flex: 1; padding: 0.75rem 0; overflow-y: auto; }
.vben-menu-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.7rem 1.25rem;
  color: rgba(255,255,255,0.65);
  font-size: 0.9rem;
  transition: all 0.18s;
  border-left: 3px solid transparent;
}
.vben-menu-item:hover { color: #fff; background: rgba(255,255,255,0.05); }
.vben-menu-item.active {
  color: #fff;
  background: var(--vben-primary);
  border-left-color: #fff;
}
.vben-body { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.vben-header {
  height: 56px;
  background: var(--vben-card);
  border-bottom: 1px solid var(--vben-border);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 1.25rem;
  position: sticky;
  top: 0;
  z-index: 10;
}
.vben-menu-btn {
  display: none;
  border: none;
  background: transparent;
  color: var(--vben-text);
  cursor: pointer;
  padding: 0.25rem;
}
.vben-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--vben-muted);
  font-size: 0.88rem;
}
.vben-breadcrumb .current { color: var(--vben-text); font-weight: 500; }
.vben-header-right { margin-left: auto; display: flex; align-items: center; gap: 1rem; }
.vben-user { font-size: 0.88rem; color: var(--vben-text); font-weight: 500; }
.vben-logout {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--vben-border);
  background: transparent;
  color: var(--vben-muted);
  border-radius: 6px;
  padding: 0.35rem 0.7rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.18s;
}
.vben-logout:hover { color: var(--vben-primary); border-color: var(--vben-primary); }
.vben-content { flex: 1; padding: 1.25rem; }
.vben-overlay { display: none; }

@media (max-width: 768px) {
  .vben-sider {
    position: fixed;
    z-index: 50;
    transform: translateX(-100%);
    transition: transform 0.25s;
  }
  .vben-sider.open { transform: translateX(0); }
  .vben-menu-btn { display: inline-flex; }
  .vben-overlay.show {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 40;
  }
}
`;
