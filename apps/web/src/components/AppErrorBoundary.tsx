import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an error', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="app-error-shell">
        <div className="card app-error-card">
          <AlertTriangle size={30} strokeWidth={1.8} className="app-error-icon" />
          <h1>页面出现错误</h1>
          <p>这个页面刚刚运行失败了，但应用没有崩溃。你可以刷新当前页面，或先返回知识目录继续使用。</p>
          <div className="app-error-actions">
            <button type="button" className="btn btn-primary" onClick={this.handleReload}>
              <RefreshCw size={15} strokeWidth={2} />
              刷新页面
            </button>
            <Link to="/chemistry" className="btn btn-ghost">
              返回知识目录
            </Link>
          </div>
        </div>
        <style>{`
          .app-error-shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            background: radial-gradient(circle at top, var(--primary-muted), transparent 55%), var(--bg);
          }
          .app-error-card {
            width: min(560px, 100%);
            padding: 2rem;
            text-align: center;
          }
          .app-error-icon {
            color: var(--warning);
            margin-bottom: 0.85rem;
          }
          .app-error-card h1 {
            font-size: 1.55rem;
            margin-bottom: 0.65rem;
            color: var(--text);
          }
          .app-error-card p {
            color: var(--text-secondary);
            margin-bottom: 1.25rem;
          }
          .app-error-actions {
            display: flex;
            justify-content: center;
            gap: 0.75rem;
            flex-wrap: wrap;
          }
        `}</style>
      </div>
    );
  }
}
