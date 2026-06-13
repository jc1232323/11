import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Target,
  TrendingDown,
  XCircle,
} from 'lucide-react';
import { api } from '../lib/api';

type QuestionResult = {
  questionId: string;
  correct: boolean;
  earnedScore: number;
  maxScore: number;
  userAnswer: string;
  correctAnswer: string;
};

type KnowledgeAnalysis = {
  point: string;
  total: number;
  correct: number;
  percentage: number;
};

type ExamReport = {
  totalScore: number;
  earnedScore: number;
  percentage: number;
  grade: string;
  duration: number;
  questionResults: QuestionResult[];
  knowledgePointAnalysis: KnowledgeAnalysis[];
  weakPoints: string[];
};

type AttemptDetail = {
  id: string;
  examId: string;
  score: number | null;
  totalScore: number;
  startedAt: string;
  submittedAt: string | null;
  report: ExamReport | null;
};

export function ExamReportPage() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<AttemptDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    api<AttemptDetail>(`/exam/attempts/${attemptId}`)
      .then(setAttempt)
      .catch(() => navigate('/exam', { replace: true }))
      .finally(() => setLoading(false));
  }, [attemptId, navigate]);

  if (loading) {
    return (
      <div className="container report-page" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!attempt?.report) {
    return (
      <div className="container report-page">
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' }}>
          报告不存在或考试尚未提交
        </p>
      </div>
    );
  }

  const report = attempt.report;
  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} 分 ${s} 秒`;
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case '优秀': return '#059669';
      case '良好': return '#0284c7';
      case '中等': return '#d97706';
      case '及格': return '#ea580c';
      default: return '#dc2626';
    }
  };

  return (
    <div className="container report-page">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <button type="button" className="report-back-btn" onClick={() => navigate('/exam')}>
          <ArrowLeft size={18} strokeWidth={2} />
          <span>返回试卷列表</span>
        </button>

        {/* Score overview */}
        <div className="report-score-card">
          <div className="report-score-main">
            <div className="report-score-circle" style={{ borderColor: getGradeColor(report.grade) }}>
              <span className="report-score-number">{report.earnedScore}</span>
              <span className="report-score-total">/ {report.totalScore}</span>
            </div>
            <div className="report-score-info">
              <span className="report-grade" style={{ color: getGradeColor(report.grade) }}>
                <Award size={18} />
                {report.grade}
              </span>
              <span className="report-percentage">{report.percentage}%</span>
            </div>
          </div>
          <div className="report-meta-row">
            <div className="report-meta-item">
              <Clock size={15} />
              <span>用时 {formatDuration(report.duration)}</span>
            </div>
            <div className="report-meta-item">
              <CheckCircle2 size={15} />
              <span>答对 {report.questionResults.filter((r) => r.correct).length}/{report.questionResults.length} 题</span>
            </div>
            <div className="report-meta-item">
              <Target size={15} />
              <span>正确率 {report.percentage}%</span>
            </div>
          </div>
        </div>

        {/* Weak points */}
        {report.weakPoints.length > 0 && (
          <div className="report-section report-weak">
            <h3><TrendingDown size={18} /> 薄弱环节</h3>
            <p className="report-weak-desc">以下知识点正确率低于 60%，建议重点复习：</p>
            <div className="report-weak-list">
              {report.weakPoints.map((point) => (
                <span key={point} className="report-weak-tag">{point}</span>
              ))}
            </div>
          </div>
        )}

        {/* Knowledge point analysis */}
        <div className="report-section">
          <h3>知识点分析</h3>
          <div className="report-kp-list">
            {report.knowledgePointAnalysis.map((kp) => (
              <div key={kp.point} className="report-kp-item">
                <div className="report-kp-header">
                  <span className="report-kp-name">{kp.point}</span>
                  <span className="report-kp-stat">{kp.correct}/{kp.total}</span>
                </div>
                <div className="report-kp-bar">
                  <div
                    className="report-kp-fill"
                    style={{
                      width: `${kp.percentage}%`,
                      background: kp.percentage >= 60 ? '#10b981' : '#ef4444',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question results */}
        <div className="report-section">
          <h3>答题详情</h3>
          <div className="report-questions">
            {report.questionResults.map((result, i) => (
              <div key={result.questionId} className={`report-q-item ${result.correct ? 'correct' : 'wrong'}`}>
                <div className="report-q-header">
                  <span className="report-q-index">第 {i + 1} 题</span>
                  {result.correct ? (
                    <CheckCircle2 size={16} className="report-q-icon correct" />
                  ) : (
                    <XCircle size={16} className="report-q-icon wrong" />
                  )}
                  <span className="report-q-score">
                    {result.earnedScore}/{result.maxScore} 分
                  </span>
                </div>
                {!result.correct && (
                  <div className="report-q-detail">
                    <p><span className="report-q-label">你的答案：</span>{result.userAnswer || '（未作答）'}</p>
                    <p><span className="report-q-label">正确答案：</span>{result.correctAnswer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <style>{`
        .report-page { padding-bottom: 3rem; }
        .report-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.8rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: #fff;
          color: var(--text-secondary);
          font-size: 0.84rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--duration) var(--ease);
          margin-bottom: 1.5rem;
        }
        .report-back-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-light);
        }
        .report-score-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .report-score-main {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .report-score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 4px solid;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .report-score-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
        }
        .report-score-total {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .report-score-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.4rem;
        }
        .report-grade {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 1.2rem;
          font-weight: 700;
        }
        .report-percentage {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .report-meta-row {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
        }
        .report-meta-item {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.84rem;
          color: var(--text-secondary);
        }
        .report-section {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .report-section h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .report-weak {
          border-color: rgba(239, 68, 68, 0.2);
          background: #fffbfb;
        }
        .report-weak-desc {
          font-size: 0.86rem;
          color: var(--text-muted);
          margin-bottom: 0.75rem;
        }
        .report-weak-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .report-weak-tag {
          padding: 0.3rem 0.7rem;
          border-radius: 999px;
          background: rgba(239, 68, 68, 0.1);
          color: #dc2626;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .report-kp-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .report-kp-item {}
        .report-kp-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.35rem;
        }
        .report-kp-name {
          font-size: 0.86rem;
          color: var(--text);
          font-weight: 500;
        }
        .report-kp-stat {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .report-kp-bar {
          height: 8px;
          background: var(--bg-subtle);
          border-radius: 4px;
          overflow: hidden;
        }
        .report-kp-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .report-questions {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .report-q-item {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }
        .report-q-item.correct { border-left: 3px solid #10b981; }
        .report-q-item.wrong { border-left: 3px solid #ef4444; }
        .report-q-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .report-q-index {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .report-q-icon.correct { color: #10b981; }
        .report-q-icon.wrong { color: #ef4444; }
        .report-q-score {
          margin-left: auto;
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .report-q-detail {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px dashed var(--border-light);
          font-size: 0.84rem;
          color: var(--text-secondary);
          line-height: 1.7;
        }
        .report-q-label {
          font-weight: 500;
          color: var(--text-muted);
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
        @media (max-width: 768px) {
          .report-meta-row { flex-direction: column; align-items: center; gap: 0.5rem; }
          .report-score-main { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
