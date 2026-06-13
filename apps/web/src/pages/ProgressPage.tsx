import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, CheckCircle, Flame, Award } from 'lucide-react';
import { api } from '../lib/api';

interface ProgressStats {
  topicsViewed: number;
  questionsAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  longestStreak: number;
}

interface KnowledgeNode {
  id: string;
  name: string;
  children?: KnowledgeNode[];
}

function countTopics(nodes: KnowledgeNode[]): number {
  let count = 0;
  for (const node of nodes) {
    count += 1;
    if (node.children) {
      count += countTopics(node.children);
    }
  }
  return count;
}

export default function ProgressPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [totalTopics, setTotalTopics] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api<ProgressStats>('/progress/stats'),
      api<KnowledgeNode[]>('/knowledge/tree'),
    ]).then(([progressData, tree]) => {
      setStats(progressData);
      setTotalTopics(countTopics(tree));
    }).finally(() => setLoading(false));
  }, []);

  const correctRate = stats && stats.questionsAnswered > 0
    ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
    : 0;

  const progressPercent = stats && totalTopics > 0
    ? Math.round((stats.topicsViewed / totalTopics) * 100)
    : 0;

  return (
    <div className="progress-page">
      <motion.div
        className="progress-header"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <TrendingUp size={28} />
        <h1>学习进度</h1>
      </motion.div>

      {loading ? (
        <p className="progress-loading">加载中...</p>
      ) : stats ? (
        <>
          <motion.div
            className="progress-bar-section"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="progress-bar-label">
              <span>知识点进度</span>
              <span>{stats.topicsViewed} / {totalTopics}</span>
            </div>
            <div className="progress-bar-track">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              />
            </div>
            <span className="progress-bar-percent">{progressPercent}%</span>
          </motion.div>

          <div className="progress-grid">
            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <BookOpen size={24} className="stat-icon" />
              <span className="stat-number">{stats.questionsAnswered}</span>
              <span className="stat-label">已答题数</span>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <CheckCircle size={24} className="stat-icon" />
              <span className="stat-number">{correctRate}%</span>
              <span className="stat-label">正确率</span>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <Flame size={24} className="stat-icon" />
              <span className="stat-number">{stats.currentStreak}</span>
              <span className="stat-label">当前连续天数</span>
            </motion.div>

            <motion.div
              className="stat-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <Award size={24} className="stat-icon" />
              <span className="stat-number">{stats.longestStreak}</span>
              <span className="stat-label">最长连续天数</span>
            </motion.div>
          </div>
        </>
      ) : (
        <p className="progress-loading">暂无数据</p>
      )}
      <style>{`
        .progress-page {
          max-width: 720px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        .progress-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
          color: var(--text);
        }
        .progress-header h1 {
          font-size: 1.5rem;
          margin: 0;
        }
        .progress-loading {
          color: var(--text-muted);
          text-align: center;
          padding: 2rem 0;
        }
        .progress-bar-section {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .progress-bar-label {
          display: flex;
          justify-content: space-between;
          color: var(--text);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        .progress-bar-track {
          height: 10px;
          background: var(--border);
          border-radius: 5px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: var(--primary);
          border-radius: 5px;
        }
        .progress-bar-percent {
          display: block;
          text-align: right;
          color: var(--text-secondary);
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }
        .progress-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1rem;
        }
        .stat-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-align: center;
        }
        .stat-icon {
          color: var(--primary);
        }
        .stat-number {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text);
        }
        .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
