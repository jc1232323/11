import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, BookOpen, Dumbbell, Settings, Info, Menu, LogOut, User } from 'lucide-react';

const sidebarNav = [
  { to: '/', label: 'AI 问答', icon: MessageSquare },
  { to: '/chemistry', label: '化学知识', icon: BookOpen },
  { to: '/training', label: '专题训练', icon: Dumbbell },
  { to: '/settings', label: '设置', icon: Settings },
  { to: '/about', label: '关于', icon: Info },
];

const publicNav = [
  { to: '/about', label: '关于' },
];

function PublicLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="layout">
      {!isAuthPage && (
        <header className="public-header">
          <div className="container public-header-inner">
            <Link to="/" className="public-logo">
              化学<span>问答</span>
            </Link>
            <nav className="public-nav">
              {publicNav.map((item) => (
                <NavLink key={item.to} to={item.to} className="btn btn-ghost">
                  {item.label}
                </NavLink>
              ))}
              {user ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => logout()}
                >
                  退出
                </button>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost">
                    登录
                  </Link>
                  <Link to="/register" className="btn btn-primary">
                    注册
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
      )}
      <motion.main
        className="main"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <Outlet />
      </motion.main>
      <style>{`
        .layout { min-height: 100vh; display: flex; flex-direction: column; }
        .main { flex: 1; padding: 1.5rem 0 3rem; }
      `}</style>
    </div>
  );
}

function AppShell() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link to="/" className="sidebar-logo" onClick={() => setSidebarOpen(false)}>
          化学<span>问答</span>
        </Link>
        <nav className="sidebar-nav">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive ? 'sidebar-nav-item active' : 'sidebar-nav-item'
                }
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-user">
            <User size={14} strokeWidth={1.8} />
            {user?.nickname}
          </span>
          <button type="button" className="btn btn-ghost" onClick={() => logout()}>
            <LogOut size={15} strokeWidth={1.8} />
            退出
          </button>
        </div>
      </aside>
      <div className="app-main">
        <div className="mobile-topbar">
          <button
            type="button"
            className="menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="打开菜单"
          >
            <Menu size={20} />
          </button>
          <span className="public-logo">
            化学<span>问答</span>
          </span>
        </div>
        <motion.main
          className="app-main-content"
          key={location.pathname}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

export function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/register';

  if (!user || isAuthPage) {
    return <PublicLayout />;
  }

  return <AppShell />;
}
