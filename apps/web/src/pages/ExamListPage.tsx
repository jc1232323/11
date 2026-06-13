import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileCheck, Play, Trophy, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import {
  getFallbackExamPapers,
  listFallbackExamAttempts,
  startFallbackExamAttempt,
} from '../lib/exam-fallback';

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

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const childVariant = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  },
};

export function ExamListPage() {
  const navigate = useNavigate();
  const [papers, setPapers] = useState<ExamPaper[]>([]);
  const [attempts, setAttempts] = useState<ExamAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

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

      {papers.length === 0 ? (
        <div className="exam-empty">
          <AlertCircle size={40} strokeWidth={1.4} />
          <p>暂无试卷，请先运行种子脚本导入试卷数据</p>
        </div>
      ) : (
        <motion.div
          className="exam-grid"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {papers.map((paper) => {
            const best = getBestScore(paper.examId);
            const history = getAttemptHistory(paper.examId);
            return (
              <motion.section
                key={paper.examId}
                className="card exam-card"
                variants={childVariant}
              >
                <div className="exam-card-head">
                  <div className="exam-card-icon">
                    <FileCheck size={20} strokeWidth={1.8} />
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
