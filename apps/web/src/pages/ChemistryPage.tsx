import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, type KnowledgeTree } from '../lib/api';
import { BookOpen, Check, ChevronRight, Layers, Loader2, Search, X } from 'lucide-react';

type SearchResult = { slug: string; title: string; chapterTitle: string | null; snippet: string | null };

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [viewedSlugs, setViewedSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    api<KnowledgeTree>('/knowledge/tree')
      .then(setTree)
      .catch(() => setError('加载失败，请先运行 import-content 导入知识点'))
      .finally(() => setLoading(false));
    // Load user's viewed topics
    api<string[]>('/progress/viewed-topics')
      .then((slugs) => setViewedSlugs(new Set(slugs)))
      .catch(() => {});
  }, []);

  const doSearch = useCallback((q: string) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    api<SearchResult[]>(`/knowledge/search?q=${encodeURIComponent(q.trim())}`)
      .then(setSearchResults)
      .catch(() => setSearchResults([]))
      .finally(() => setSearching(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, doSearch]);

  const topicCount = tree.reduce(
    (sum, mod) =>
      sum + mod.chapters.reduce((s, ch) => s + ch.topics.length, 0),
    0,
  );

  /** Count viewed topics in a module */
  function getModuleProgress(mod: KnowledgeTree[number]) {
    let total = 0;
    let viewed = 0;
    for (const ch of mod.chapters) {
      for (const t of ch.topics) {
        total++;
        if (viewedSlugs.has(t.slug)) viewed++;
      }
    }
    return { total, viewed };
  }

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
              ? `${tree.length} 个模块 · ${topicCount} 个知识点 · 已学 ${viewedSlugs.size}`
              : '按模块、章节浏览高中化学核心内容'}
          </p>
        </div>
      </motion.header>

      <div className="chem-search-wrap">
        <Search size={16} strokeWidth={1.8} className="chem-search-icon" />
        <input
          className="chem-search-input"
          type="text"
          placeholder="搜索知识点..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button className="chem-search-clear" onClick={() => { setSearchQuery(''); setSearchResults([]); }}>
            <X size={14} strokeWidth={2} />
          </button>
        )}
      </div>

      {searchQuery.trim() && (
        <div className="chem-search-results card">
          {searching && <p className="chem-search-status">搜索中...</p>}
          {!searching && searchResults.length === 0 && <p className="chem-search-status">未找到相关知识点</p>}
          {searchResults.map((r) => (
            <Link key={r.slug} to={`/chemistry/${r.slug}`} className="chem-search-item">
              <div>
                {viewedSlugs.has(r.slug) && <Check size={14} strokeWidth={2.5} className="chem-search-item-check" />}
                <span className="chem-search-item-title">{r.title}</span>
                {r.chapterTitle && <span className="chem-search-item-chapter">{r.chapterTitle}</span>}
              </div>
              {r.snippet && <p className="chem-search-item-snippet">{r.snippet}</p>}
            </Link>
          ))}
        </div>
      )}

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
        {tree.map((mod) => {
          const { total, viewed } = getModuleProgress(mod);
          const pct = total > 0 ? Math.round((viewed / total) * 100) : 0;

          return (
            <motion.section key={mod.id} className="card chem-module" variants={childVariant}>
              <div className="chem-module-head">
                <div className="chem-module-icon">
                  <Layers size={18} strokeWidth={1.6} />
                </div>
                <h2>{mod.title}</h2>
                <div className="chem-module-progress">
                  <div className="chem-progress-bar">
                    <div className="chem-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="chem-progress-text">{viewed}/{total}</span>
                </div>
              </div>
              <div className="chem-chapters">
                {mod.chapters.map((chapter) => (
                  <div key={chapter.id} className="chem-chapter">
                    <h3 className="chem-chapter-title">{chapter.title}</h3>
                    <ul className="chem-topics">
                      {chapter.topics.map((topic) => {
                        const isViewed = viewedSlugs.has(topic.slug);
                        return (
                          <li key={topic.id}>
                            <Link to={`/chemistry/${topic.slug}`} className={`chem-topic-link ${isViewed ? 'viewed' : ''}`}>
                              <span className="chem-topic-name">
                                {isViewed && <Check size={14} strokeWidth={2.5} className="chem-topic-check" />}
                                {topic.title}
                              </span>
                              <ChevronRight size={14} strokeWidth={1.8} />
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.section>
          );
        })}
      </motion.div>

      <style>{`
        .chem-page { padding-bottom: 2rem; }
        .chem-search-wrap {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .chem-search-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
          pointer-events: none;
        }
        .chem-search-input {
          width: 100%;
          padding: 0.7rem 2.5rem 0.7rem 2.5rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          background: var(--bg);
          font-size: 0.9rem;
          color: var(--text);
          transition: border-color var(--duration) var(--ease), box-shadow var(--duration) var(--ease);
        }
        .chem-search-input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
          background: var(--bg-elevated);
        }
        .chem-search-clear {
          position: absolute;
          right: 0.7rem;
          border: none;
          background: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 0.2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
        }
        .chem-search-clear:hover { color: var(--text); background: var(--bg-subtle); }
        .chem-search-results {
          margin-bottom: 1.5rem;
          padding: 0.5rem;
          max-height: 360px;
          overflow-y: auto;
        }
        .chem-search-status {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.85rem;
          padding: 1rem;
        }
        .chem-search-item {
          display: block;
          padding: 0.7rem 0.85rem;
          border-radius: var(--radius-sm);
          transition: background var(--duration) var(--ease);
          text-decoration: none;
        }
        .chem-search-item:hover { background: var(--primary-light); }
        .chem-search-item-check { color: #10b981; margin-right: 0.3rem; vertical-align: -2px; }
        .chem-search-item-title {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text);
        }
        .chem-search-item-chapter {
          margin-left: 0.5rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .chem-search-item-snippet {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
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
        .chem-module { padding: 1.5rem; }
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
          flex: 1;
        }
        .chem-module-progress {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .chem-progress-bar {
          width: 80px;
          height: 6px;
          border-radius: 3px;
          background: var(--border-light);
          overflow: hidden;
        }
        .chem-progress-fill {
          height: 100%;
          border-radius: 3px;
          background: #10b981;
          transition: width 0.4s ease;
        }
        .chem-progress-text {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          white-space: nowrap;
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
        .chem-topic-link.viewed {
          color: var(--text-muted);
        }
        .chem-topic-name {
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
        .chem-topic-check {
          color: #10b981;
          flex-shrink: 0;
        }
        .chem-topic-link > svg {
          opacity: 0;
          transform: translateX(-4px);
          transition: all var(--duration) var(--ease);
        }
        .chem-topic-link:hover > svg {
          opacity: 1;
          transform: translateX(0);
        }
        @media (max-width: 768px) {
          .chem-module-progress { display: none; }
        }
      `}</style>
    </div>
  );
}
