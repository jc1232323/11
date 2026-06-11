import { Navigate, useLocation } from 'react-router-dom';

export function ChatRedirect() {
  const location = useLocation();
  return <Navigate to="/" replace state={location.state} />;
}
