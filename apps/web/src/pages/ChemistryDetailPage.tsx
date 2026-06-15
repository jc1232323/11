import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MarkdownView } from '../components/MarkdownView';
import type { KnowledgeAskState } from '../lib/knowledge-ask';
import { ApiError, api, type KnowledgeDetail } from '../lib/api';
import { BookOpen, GraduationCap, ChevronLeft, ChevronRight, Loader2, Sparkles, Star, TriangleAlert } from 'lucide-react';

/** 懒加载动画组件映射 — 按需加载，不影响首屏 */
const illustrationLoaders: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  'mol-concept': () => import('../components/chemistry-illustrations/MolConceptAnimation').then(m => ({ default: m.MolConceptAnimation })),
  'gas-molar-volume': () => import('../components/chemistry-illustrations/GasMolarVolumeAnimation').then(m => ({ default: m.GasMolarVolumeAnimation })),
  'amount-concentration': () => import('../components/chemistry-illustrations/ConcentrationAnimation').then(m => ({ default: m.ConcentrationAnimation })),
  'electrolyte': () => import('../components/chemistry-illustrations/ElectrolyteAnimation').then(m => ({ default: m.ElectrolyteAnimation })),
  'ion-equations': () => import('../components/chemistry-illustrations/IonEquationsAnimation').then(m => ({ default: m.IonEquationsAnimation })),
  'precipitation': () => import('../components/chemistry-illustrations/PrecipitationAnimation').then(m => ({ default: m.PrecipitationAnimation })),
  'redox-intro': () => import('../components/chemistry-illustrations/RedoxAnimation').then(m => ({ default: m.RedoxAnimation })),
  'atom-structure': () => import('../components/chemistry-illustrations/AtomStructureAnimation').then(m => ({ default: m.AtomStructureAnimation })),
  'ionic-covalent-bond': () => import('../components/chemistry-illustrations/IonicCovalentBondAnimation').then(m => ({ default: m.IonicCovalentBondAnimation })),
  'enthalpy': () => import('../components/chemistry-illustrations/EnthalpyAnimation').then(m => ({ default: m.EnthalpyAnimation })),
  'hess-law': () => import('../components/chemistry-illustrations/HessLawAnimation').then(m => ({ default: m.HessLawAnimation })),
  'rate-factors': () => import('../components/chemistry-illustrations/ReactionRateAnimation').then(m => ({ default: m.ReactionRateAnimation })),
  'collision-theory': () => import('../components/chemistry-illustrations/CollisionTheoryAnimation').then(m => ({ default: m.CollisionTheoryAnimation })),
  'alkanes-alkenes': () => import('../components/chemistry-illustrations/AlkanesAlkenesAnimation').then(m => ({ default: m.AlkanesAlkenesAnimation })),
  'alcohols-phenols': () => import('../components/chemistry-illustrations/AlcoholsPhenolsAnimation').then(m => ({ default: m.AlcoholsPhenolsAnimation })),
};

/** 缓存 lazy() 结果，避免重复创建 */
const lazyCache = new Map<string, React.LazyExoticComponent<React.ComponentType>>();
function getLazyIllustration(slug: string) {
  if (!illustrationLoaders[slug]) return null;
  if (!lazyCache.has(slug)) {
    lazyCache.set(slug, lazy(illustrationLoaders[slug]));
  }
  return lazyCache.get(slug)!;
}

export function ChemistryDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<KnowledgeDetail | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const LazyIllustration = useMemo(() => (slug ? getLazyIllustration(slug) : null), [slug]);
  const body = detail?.mdBody.replace(/^---[\s\S]*?---\n/, '') ?? '';

  useEffect(() => {
    let cancelled = false;

    if (!slug) {
      setDetail(null);
      setFavorited(false);
      setError('知识点链接无效');
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);
    setError('');
    setDetail(null);
    setFavorited(false);

    api<KnowledgeDetail>(`/knowledge/${slug}`)
      .then((result) => {
        if (cancelled) return;
        setDetail(result);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setDetail(null);
        if (err instanceof ApiError && err.status === 404) {
          setError('该知识点不存在或尚未导入');
          return;
        }
        setError('知识点加载失败，请稍后重试');
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    api<{ favorited: boolean }>(`/favorites/check/topic/${slug}`)
      .then((r) => {
        if (cancelled) return;
        setFavorited(r.favorited);
      })
      .catch(() => {});

    api('/progress/view', { method: 'POST', body: JSON.stringify({ topicSlug: slug }) }).catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slug]);

  async function toggleFavorite() {
    if (!slug) return;
    if (favorited) {
      await api(`/favorites/topic/${slug}`, { method: 'DELETE' }).catch(() => {});
      setFavorited(false);
    } else {
      await api('/favorites', { method: 'POST', body: JSON.stringify({ type: 'topic', targetId: slug }) }).catch(() => {});
      setFavorited(true);
    }
  }

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

  if (loading) {
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

  if (error || !detail) {
    return (
      <div className="container detail-empty-state">
        <div className="card detail-empty-card">
          <TriangleAlert size={28} strokeWidth={1.8} className="detail-empty-icon" />
          <h1>知识点暂时无法打开</h1>
          <p>{error || '当前知识点数据异常，请返回目录重新进入。'}</p>
          <div className="detail-empty-actions">
            <Link to="/chemistry" className="btn btn-primary">
              返回知识目录
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => window.location.reload()}
            >
              重新加载
            </button>
          </div>
        </div>
        <style>{`
          .detail-empty-state {
            display: flex;
            justify-content: center;
            padding: 3rem 0 2rem;
          }
          .detail-empty-card {
            width: min(560px, 100%);
            padding: 2rem;
            text-align: center;
          }
          .detail-empty-icon {
            color: var(--warning);
            margin-bottom: 0.9rem;
          }
          .detail-empty-card h1 {
            font-size: 1.5rem;
            margin-bottom: 0.65rem;
            color: var(--text);
          }
          .detail-empty-card p {
            color: var(--text-secondary);
            margin-bottom: 1.25rem;
          }
          .detail-empty-actions {
            display: flex;
            justify-content: center;
            gap: 0.75rem;
            flex-wrap: wrap;
          }
        `}</style>
      </div>
    );
  }

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

      <div className="detail-title-row">
        <h1 className="detail-title">{detail.title}</h1>
        <button
          type="button"
          className={`detail-fav-btn ${favorited ? 'active' : ''}`}
          onClick={toggleFavorite}
          title={favorited ? '取消收藏' : '收藏知识点'}
        >
          <Star size={18} strokeWidth={1.8} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="detail-body markdown-body">
        <MarkdownView content={body} />
        {LazyIllustration && (
          <Suspense fallback={<div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>加载动画...</div>}>
            <LazyIllustration />
          </Suspense>
        )}
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
        .detail-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .detail-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 0;
          color: var(--text);
        }
        .detail-fav-btn {
          border: 1px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-muted);
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all var(--duration) var(--ease);
        }
        .detail-fav-btn:hover { border-color: #f59e0b; color: #f59e0b; }
        .detail-fav-btn.active { border-color: #f59e0b; color: #f59e0b; background: rgba(245,158,11,0.08); }
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
