import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Only authenticated admin users may pass; everyone else goes to /login. */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
        加载中…
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
