import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MarkdownView } from '../components/MarkdownView';
import type { KnowledgeAskState } from '../lib/knowledge-ask';
import { api, type KnowledgeDetail } from '../lib/api';
import { BookOpen, GraduationCap, ChevronLeft, ChevronRight, Loader2, Sparkles } from 'lucide-react';

export function ChemistryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<KnowledgeDetail | null>(null);

  useEffect(() => {
    if (!slug) return;
    api<KnowledgeDetail>(`/knowledge/${slug}`).then(setDetail).catch(() => setDetail(null));
  }, [slug]);

  function goAi(mode: KnowledgeAskState['mode']) {
    if (!detail) return;
    const state: KnowledgeAskState = {
      slug: detail.slug,
      title: detail.title,
      chapterTitle: detail.chapterTitle,
      mdBody: detail.mdBody,
      mode,
    };
    navigate('/', { state: { knowledgeAsk: state } });
  }

  if (!detail) {
    return (
      <div className="container detail-loading">
        <Loader2 size={24} className="detail-spinner" />
        <span>加载中...</span>
        <style>{`
          .detail-loading {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            justify-content: center;
            padding: 4rem 0;
            color: var(--text-muted);
          }
          .detail-spinner { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  const body = detail.mdBody.replace(/^---[\s\S]*?---\n/, '');

  return (
    <motion.article
      className="container detail-page"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
    >
      <nav className="detail-breadcrumb">
        <Link to="/chemistry" className="detail-back">
          <ChevronLeft size={14} strokeWidth={2} />
          化学知识
        </Link>
        {detail.moduleTitle && (
          <>
            <span className="detail-sep">/</span>
            <span>{detail.moduleTitle}</span>
          </>
        )}
        {detail.chapterTitle && (
          <>
            <span className="detail-sep">/</span>
            <span>{detail.chapterTitle}</span>
          </>
        )}
      </nav>

      <h1 className="detail-title">{detail.title}</h1>

      <div className="detail-body markdown-body">
        <MarkdownView content={body} />
      </div>

      <div className="detail-ai-bar">
        <div className="detail-ai-info">
          <Sparkles size={18} strokeWidth={1.8} />
          <p>结合本节知识点，让 AI 为你讲解或出题练习</p>
        </div>
        <div className="detail-ai-actions">
          <button type="button" className="btn btn-primary" onClick={() => goAi('explain')}>
            <BookOpen size={15} strokeWidth={2} />
            学习讲解
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => goAi('practice')}>
            <GraduationCap size={15} strokeWidth={2} />
            出题练习
          </button>
        </div>
      </div>

      <nav className="detail-pager">
        {detail.prev ? (
          <Link to={`/chemistry/${detail.prev.slug}`} className="detail-pager-link prev">
            <ChevronLeft size={14} strokeWidth={2} />
            <span>{detail.prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {detail.next ? (
          <Link to={`/chemistry/${detail.next.slug}`} className="detail-pager-link next">
            <span>{detail.next.title}</span>
            <ChevronRight size={14} strokeWidth={2} />
          </Link>
        ) : (
          <span />
        )}
      </nav>

      <style>{`
        .detail-page { max-width: 760px; padding-bottom: 2rem; }
        .detail-breadcrumb {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
        }
        .detail-back {
          display: flex;
          align-items: center;
          gap: 0.15rem;
          color: var(--primary);
          font-weight: 500;
        }
        .detail-sep { color: var(--border); }
        .detail-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text);
        }
        .detail-body {
          line-height: 1.8;
          color: var(--text-secondary);
        }
        .detail-ai-bar {
          margin: 2.5rem 0 1.5rem;
          padding: 1.25rem 1.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid rgba(79, 110, 247, 0.15);
          background: var(--primary-muted);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .detail-ai-info {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: var(--primary);
          flex: 1;
          min-width: 200px;
        }
        .detail-ai-info p {
          color: var(--text-secondary);
          font-size: 0.92rem;
          margin: 0;
        }
        .detail-ai-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .detail-pager {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          margin-top: 1.5rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-light);
        }
        .detail-pager-link {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.9rem;
          color: var(--text-secondary);
          padding: 0.4rem 0.6rem;
          border-radius: var(--radius-sm);
          transition: all var(--duration) var(--ease);
        }
        .detail-pager-link:hover {
          color: var(--primary);
          background: var(--primary-light);
        }
      `}</style>
    </motion.article>
  );
}
