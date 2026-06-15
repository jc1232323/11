import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Crown, FileCheck, Hexagon, ClipboardList, Lock, Layers, Play, Trophy, AlertCircle, ScrollText, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { isPremium } from '../lib/membership';
import { useAuth } from '../context/AuthContext';
import {
  getFallbackExamPapers,
  getGaokaoPaperList,
  listFallbackExamAttempts,
  startFallbackExamAttempt,
} from '../lib/exam-fallback';
import { getGaokaoYears, getGaokaoRegions } from '../lib/gaokao-papers';

type ExamPaper = {
  examId: string;
  title: string;
  description: string;
  duration: number;
  totalScore: number;
  questions: Array<{ questionId: string; score: number }>;
};

type ExamAttemptSummary = {
  id: string;
  examId: string;
  score: number | null;
  totalScore: number;
  startedAt: string;
  submittedAt: string | null;
};

type Category = 'comprehensive' | 'choice' | 'organic' | 'gaokao';

const CATEGORIES: Array<{ key: Category; label: string; icon: typeof FileCheck; color: string }> = [
  { key: 'comprehensive', label: '综合模拟卷', icon: Layers, color: '#4F6EF7' },
  { key: 'choice', label: '选择题专练', icon: ClipboardList, color: '#10b981' },
  { key: 'organic', label: '有机推断', icon: Hexagon, color: '#8b5cf6' },
  { key: 'gaokao', label: '高考旧卷', icon: ScrollText, color: '#ef4444' },
];

function getCategory(examId: string): Category {
  if (examId.startsWith('choice-sprint')) return 'choice';
  if (examId.startsWith('organic-focus')) return 'organic';
  if (examId.startsWith('gaokao-')) return 'gaokao';
  return 'comprehensive';
}

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const childVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export function ExamListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const premiumUser = isPremium(user);
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [attempts, setAttempts] = useState<ExamAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('comprehensive');
  const [gaokaoYear, setGaokaoYear] = useState<number | ''>('');
  const [gaokaoRegion, setGaokaoRegion] = useState<string>('');

  // Premium gate
  if (!premiumUser) {
    return (
      <div className="container" style={{ paddingTop: '3rem', textAlign: 'center' }}>
        <Lock size={48} strokeWidth={1.4} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.3rem', color: 'var(--text)', marginBottom: '0.5rem' }}>模拟考试为会员专属功能</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>升级会员后可无限次参加模拟考试</p>
        <Link to="/membership" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <Crown size={16} strokeWidth={2} />
          升级会员
        </Link>
      </div>
    );
  }

  useEffect(() => {
    if (!premiumUser) {
      setLoading(false);
      return;
    }

    const fallbackPapers = getFallbackExamPapers();
    const fallbackAttempts = listFallbackExamAttempts();

    Promise.all([
      api<ExamPaper[]>('/exam/papers').catch(() => []),
      api<ExamAttemptSummary[]>('/exam/attempts').catch(() => []),
    ]).then(([p, a]) => {
      setPapers(Array.isArray(p) && p.length > 0 ? p : fallbackPapers);
      setAttempts(Array.isArray(a) && a.length > 0 ? a : fallbackAttempts);
      setLoading(false);
    });
  }, [premiumUser]);

  const handleStart = async (examId: string) => {
    setStarting(examId);
    try {
      await api<{ id: string }>('/exam/start', {
        method: 'POST',
        body: JSON.stringify({ examId }),
      });
      navigate(`/exam/${examId}`);
    } catch {
      const fallbackAttempt = startFallbackExamAttempt(examId);
      if (fallbackAttempt) {
        setAttempts(listFallbackExamAttempts());
        navigate(`/exam/${examId}`);
        return;
      }

      setStarting(null);
    }
  };

  const getAttemptHistory = (examId: string) =>
    attempts.filter((a) => a.examId === examId && a.submittedAt);

  const getBestScore = (examId: string) => {
    const history = getAttemptHistory(examId);
    if (history.length === 0) return null;
    return Math.max(...history.map((a) => a.score ?? 0));
  };

  if (loading) {
    return (
      <div className="container exam-list-page" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="container exam-list-page">
      <motion.header
        className="exam-header"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <div className="exam-header-icon">
          <FileCheck size={24} strokeWidth={1.6} />
        </div>
        <div>
          <h1>模拟考试</h1>
          <p className="exam-header-desc">历年真题模拟，限时答题，考后智能分析</p>
        </div>
      </motion.header>

      {/* Category Tabs */}
      <div className="exam-tabs">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const count = cat.key === 'gaokao'
            ? getGaokaoPaperList().length
            : papers.filter((p) => getCategory(p.examId) === cat.key).length;
          return (
            <button
              key={cat.key}
              type="button"
              className={`exam-tab ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
              style={{ '--tab-color': cat.color } as React.CSSProperties}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{cat.label}</span>
              <span className="exam-tab-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Gaokao tab - special layout with filters */}
      {activeCategory === 'gaokao' && (
        <div className="gaokao-section">
          <div className="gaokao-toolbar">
            <div className="gaokao-filters">
              <select
                className="gaokao-filter-select"
                value={gaokaoYear}
                onChange={(e) => setGaokaoYear(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">全部年份</option>
                {getGaokaoYears().map((y) => (
                  <option key={y} value={y}>{y}年</option>
                ))}
              </select>
              <select
                className="gaokao-filter-select"
                value={gaokaoRegion}
                onChange={(e) => setGaokaoRegion(e.target.value)}
              >
                <option value="">全部地区</option>
                {getGaokaoRegions().map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <Link to="/exam/upload" className="btn btn-primary gaokao-upload-link">
              <Upload size={15} strokeWidth={2} />
              上传真题
            </Link>
          </div>
          <motion.div className="exam-grid" key={`gaokao-${gaokaoYear}-${gaokaoRegion}`} initial="hidden" animate="visible" variants={staggerContainer}>
            {getGaokaoPaperList()
              .filter((p) => (!gaokaoYear || p.year === gaokaoYear) && (!gaokaoRegion || p.region === gaokaoRegion))
              .map((paper) => {
                const hasQuestions = paper.questionCount > 0;
                return (
                  <motion.section key={paper.examId} className={`card exam-card ${!hasQuestions ? 'exam-card-empty' : ''}`} variants={childVariant}>
                    <div className="exam-card-head">
                      <div className="exam-card-icon" style={{ background: '#ef444412', color: '#ef4444' }}>
                        <ScrollText size={20} strokeWidth={1.8} />
                      </div>
                      <div className="exam-card-title-wrap">
                        <h3>{paper.title}</h3>
                        <div className="exam-card-meta">
                          <span><Clock size={13} /> {paper.duration} 分钟</span>
                          <span>{hasQuestions ? `${paper.questionCount} 题` : '待填充'}</span>
                          <span>满分 {paper.totalScore}</span>
                        </div>
                      </div>
                    </div>
                    <p className="exam-card-desc">{paper.description}</p>
                    <div className="exam-card-footer">
                      {hasQuestions ? (
                        <button
                          type="button"
                          className="btn btn-primary exam-start-btn"
                          disabled={starting === paper.examId}
                          onClick={() => handleStart(paper.examId)}
                        >
                          <Play size={14} strokeWidth={2.5} />
                          {starting === paper.examId ? '进入中...' : '开始考试'}
                        </button>
                      ) : (
                        <span className="exam-card-pending">题目待录入</span>
                      )}
                    </div>
                  </motion.section>
                );
              })}
          </motion.div>
        </div>
      )}

      {/* Other categories - standard grid */}
      {activeCategory !== 'gaokao' && papers.filter((p) => getCategory(p.examId) === activeCategory).length === 0 && (
        <div className="exam-empty">
          <AlertCircle size={40} strokeWidth={1.4} />
          <p>该分类暂无试卷</p>
        </div>
      )}
      {activeCategory !== 'gaokao' && papers.filter((p) => getCategory(p.examId) === activeCategory).length > 0 && (
        <motion.div
          className="exam-grid"
          key={activeCategory}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {papers
            .filter((p) => getCategory(p.examId) === activeCategory)
            .map((paper) => {
              const best = getBestScore(paper.examId);
              const history = getAttemptHistory(paper.examId);
              const cat = CATEGORIES.find((c) => c.key === activeCategory)!;
              return (
                <motion.section
                  key={paper.examId}
                  className="card exam-card"
                  variants={childVariant}
                >
                  <div className="exam-card-head">
                    <div className="exam-card-icon" style={{ background: `${cat.color}12`, color: cat.color }}>
                      <cat.icon size={20} strokeWidth={1.8} />
                    </div>
                    <div className="exam-card-title-wrap">
                      <h3>{paper.title}</h3>
                      <div className="exam-card-meta">
                        <span><Clock size={13} /> {paper.duration} 分钟</span>
                        <span>{paper.questions.length} 题</span>
                        <span>满分 {paper.totalScore}</span>
                      </div>
                    </div>
                  </div>
                  <p className="exam-card-desc">{paper.description}</p>
                  {best !== null && (
                    <div className="exam-card-best">
                      <Trophy size={14} strokeWidth={2} />
                      <span>最高分：{best}/{paper.totalScore}（共考 {history.length} 次）</span>
                    </div>
                  )}
                  <div className="exam-card-footer">
                    <button
                      type="button"
                      className="btn btn-primary exam-start-btn"
                      disabled={starting === paper.examId}
                      onClick={() => handleStart(paper.examId)}
                    >
                      <Play size={14} strokeWidth={2.5} />
                      {starting === paper.examId ? '进入中...' : '开始考试'}
                    </button>
                    {history.length > 0 && (
                      <button
                        type="button"
                        className="btn btn-ghost exam-history-btn"
                        onClick={() => navigate(`/exam/report/${history[0].id}`)}
                      >
                        查看最近报告
                      </button>
                    )}
                  </div>
                </motion.section>
              );
            })}
        </motion.div>
      )}
      <style>{`
        .exam-list-page { padding-bottom: 2rem; }
        .exam-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        .exam-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1rem;
          border-radius: var(--radius);
          border: 1.5px solid var(--border);
          background: var(--bg-elevated);
          color: var(--text-secondary);
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration) var(--ease);
        }
        .exam-tab:hover {
          border-color: var(--tab-color, var(--primary));
          color: var(--tab-color, var(--primary));
        }
        .exam-tab.active {
          border-color: var(--tab-color, var(--primary));
          background: color-mix(in srgb, var(--tab-color, var(--primary)) 8%, transparent);
          color: var(--tab-color, var(--primary));
        }
        .exam-tab-count {
          font-size: 0.72rem;
          background: var(--bg-subtle);
          padding: 0.1rem 0.4rem;
          border-radius: 999px;
          color: var(--text-muted);
        }
        .exam-tab.active .exam-tab-count {
          background: color-mix(in srgb, var(--tab-color, var(--primary)) 15%, transparent);
          color: var(--tab-color, var(--primary));
        }
        .gaokao-section { margin-top: 0; }
        .gaokao-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .gaokao-filters {
          display: flex;
          gap: 0.6rem;
          flex-wrap: wrap;
        }
        .gaokao-upload-link {
          font-size: 0.84rem;
          padding: 0.5rem 0.9rem;
          text-decoration: none;
        }
        .gaokao-filter-select {
          padding: 0.5rem 0.8rem;
          border: 1.5px solid var(--border);
          border-radius: var(--radius);
          background: var(--bg-elevated);
          font-size: 0.85rem;
          color: var(--text);
          cursor: pointer;
          min-width: 120px;
        }
        .gaokao-filter-select:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }
        .exam-card-empty {
          opacity: 0.6;
          border-style: dashed;
        }
        .exam-card-pending {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-style: italic;
        }
        .exam-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .exam-header-icon {
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
        .exam-header h1 {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.15rem;
        }
        .exam-header-desc {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .exam-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 4rem 1rem;
          color: var(--text-muted);
        }
        .exam-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }
        .exam-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          transition: transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease);
        }
        .exam-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        .exam-card-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .exam-card-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .exam-card-title-wrap h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 0.25rem;
        }
        .exam-card-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .exam-card-meta span {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }
        .exam-card-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
        .exam-card-best {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.7rem;
          border-radius: 999px;
          background: rgba(245, 158, 11, 0.1);
          color: #b45309;
          font-size: 0.78rem;
          font-weight: 500;
          align-self: flex-start;
        }
        .exam-card-footer {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: auto;
          padding-top: 0.8rem;
          border-top: 1px solid var(--border-light);
        }
        .exam-start-btn {
          padding: 0.5rem 1rem;
          font-size: 0.84rem;
          border-radius: var(--radius-sm);
        }
        .exam-history-btn {
          font-size: 0.82rem;
        }
        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
