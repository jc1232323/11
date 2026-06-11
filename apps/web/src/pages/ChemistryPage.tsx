import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, type KnowledgeTree } from '../lib/api';
import { BookOpen, ChevronRight, Layers, Loader2 } from 'lucide-react';

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const childVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
};

export function ChemistryPage() {
  const [tree, setTree] = useState<KnowledgeTree>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<KnowledgeTree>('/knowledge/tree')
      .then(setTree)
      .catch(() => setError('加载失败，请先运行 import-content 导入知识点'))
      .finally(() => setLoading(false));
  }, []);

  const topicCount = tree.reduce(
    (sum, mod) =>
      sum + mod.chapters.reduce((s, ch) => s + ch.topics.length, 0),
    0,
  );

  return (
    <div className="container chem-page">
      <motion.header
        className="chem-header"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="chem-header-icon">
          <BookOpen size={24} strokeWidth={1.6} />
        </div>
        <div>
          <h1>化学知识</h1>
          <p className="chem-header-desc">
            {tree.length > 0
              ? `${tree.length} 个模块 · ${topicCount} 个知识点`
              : '按模块、章节浏览高中化学核心内容'}
          </p>
        </div>
      </motion.header>

      {error && <p className="error-text">{error}</p>}

      {loading && (
        <div className="chem-loading">
          <Loader2 size={24} className="chem-spinner" />
          <span>加载中...</span>
        </div>
      )}

      <motion.div
        className="chem-modules"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {tree.map((mod) => (
          <motion.section key={mod.id} className="card chem-module" variants={childVariant}>
            <div className="chem-module-head">
              <div className="chem-module-icon">
                <Layers size={18} strokeWidth={1.6} />
              </div>
              <h2>{mod.title}</h2>
            </div>
            <div className="chem-chapters">
              {mod.chapters.map((chapter) => (
                <div key={chapter.id} className="chem-chapter">
                  <h3 className="chem-chapter-title">{chapter.title}</h3>
                  <ul className="chem-topics">
                    {chapter.topics.map((topic) => (
                      <li key={topic.id}>
                        <Link to={`/chemistry/${topic.slug}`} className="chem-topic-link">
                          <span>{topic.title}</span>
                          <ChevronRight size={14} strokeWidth={1.8} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.section>
        ))}
      </motion.div>

      <style>{`
        .chem-page { padding-bottom: 2rem; }
        .chem-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .chem-header-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .chem-header h1 {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.15rem;
        }
        .chem-header-desc {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .chem-loading {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          justify-content: center;
          padding: 3rem 0;
        }
        .chem-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .chem-modules {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .chem-module {
          padding: 1.5rem;
        }
        .chem-module-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-light);
        }
        .chem-module-icon {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-sm);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .chem-module-head h2 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
        }
        .chem-chapters {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .chem-chapter-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }
        .chem-topics { list-style: none; }
        .chem-topic-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          color: var(--text);
          font-size: 0.9rem;
          transition: all var(--duration) var(--ease);
        }
        .chem-topic-link:hover {
          background: var(--primary-light);
          color: var(--primary);
        }
        .chem-topic-link svg {
          opacity: 0;
          transform: translateX(-4px);
          transition: all var(--duration) var(--ease);
        }
        .chem-topic-link:hover svg {
          opacity: 1;
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
}
