import { ChatWorkspace } from '../components/ChatWorkspace';
import { useAuth } from '../context/AuthContext';
import { GuestHomePage } from './GuestHomePage';

export function HomePage() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="ai-page-bg">
        <ChatWorkspace />
      </div>
    );
  }

  return <GuestHomePage />;
}
