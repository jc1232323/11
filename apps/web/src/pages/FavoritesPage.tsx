import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, BookMarked, Trash2, AlertCircle } from 'lucide-react';
import { ApiError, api } from '../lib/api';

interface FavoriteItem {
  id: string;
  userId: string;
  type: 'topic' | 'question';
  targetId: string;
  note: string;
  createdAt: string;
}

type TabType = 'topic' | 'question';

export default function FavoritesPage() {
  const [tab, setTab] = useState<TabType>('topic');
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function fetchItems(type: TabType) {
    setLoading(true);
    setError('');
    try {
      const data = await api<FavoriteItem[]>(`/favorites?type=${type}`);
      setItems(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchItems(tab);
  }, [tab]);

  async function handleDelete(item: FavoriteItem) {
    try {
      await api(`/favorites/${item.type}/${item.targetId}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '删除失败');
    }
  }

  return (
    <div className="favorites-page">
      <motion.div
        className="favorites-header"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <Star size={28} />
        <h1>我的收藏</h1>
      </motion.div>

      <motion.div
        className="favorites-tabs"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <button
          className={`tab-btn ${tab === 'topic' ? 'active' : ''}`}
          onClick={() => setTab('topic')}
        >
          <BookMarked size={16} />
          收藏知识点
        </button>
        <button
          className={`tab-btn ${tab === 'question' ? 'active' : ''}`}
          onClick={() => setTab('question')}
        >
          <AlertCircle size={16} />
          错题本
        </button>
      </motion.div>

      {error && (
        <motion.p
          className="favorites-error"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}

      <motion.div
        className="favorites-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        {loading ? (
          <p className="favorites-empty">加载中...</p>
        ) : items.length === 0 ? (
          <p className="favorites-empty">暂无内容</p>
        ) : (
          <ul className="favorites-list">
            {items.map((item) => (
              <li key={item.id} className="favorites-item">
                <div className="favorites-item-content">
                  {tab === 'topic' ? (
                    <a href={`/chemistry/${item.targetId}`} className="favorites-link">
                      <BookMarked size={16} />
                      <span>{item.note || item.targetId}</span>
                    </a>
                  ) : (
                    <span className="favorites-question">
                      <AlertCircle size={16} />
                      <span>{item.note || item.targetId}</span>
                    </span>
                  )}
                </div>
                <button
                  className="favorites-delete"
                  onClick={() => handleDelete(item)}
                  aria-label="删除"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
      <style>{`
        .favorites-page {
          max-width: 720px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .favorites-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          color: var(--text);
        }
        .favorites-header h1 {
          font-size: 1.5rem;
          margin: 0;
        }
        .favorites-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          cursor: pointer;
          font-size: 0.9rem;
          transition: all var(--duration) var(--ease);
        }
        .tab-btn.active {
          background: var(--primary);
          color: #fff;
          border-color: var(--primary);
        }
        .favorites-error {
          color: var(--danger);
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }
        .favorites-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1rem;
        }
        .favorites-empty {
          color: var(--text-muted);
          text-align: center;
          padding: 2rem 0;
          margin: 0;
        }
        .favorites-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .favorites-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0.5rem;
          border-bottom: 1px solid var(--border);
        }
        .favorites-item:last-child {
          border-bottom: none;
        }
        .favorites-item-content {
          flex: 1;
          min-width: 0;
        }
        .favorites-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary);
          text-decoration: none;
          font-size: 0.9rem;
          transition: opacity var(--duration) var(--ease);
        }
        .favorites-link:hover {
          opacity: 0.8;
        }
        .favorites-question {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text);
          font-size: 0.9rem;
        }
        .favorites-delete {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.4rem;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: color var(--duration) var(--ease), background var(--duration) var(--ease);
        }
        .favorites-delete:hover {
          color: var(--danger);
          background: var(--bg);
        }
      `}</style>
    </div>
  );
}
