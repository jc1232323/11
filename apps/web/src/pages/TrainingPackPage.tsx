import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BookOpenCheck,
  ChevronDown,
  ClipboardList,
  Eye,
  EyeOff,
  FlaskConical,
  Hexagon,
  Loader2,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api';
import { TRAINING_PACKS } from '../lib/training-packs';

type QuestionFromApi = {
  id: string;
  title: string;
  type: string;
  prompt: string;
  options: Array<{ key: string; text: string }> | null;
  answer: string;
  analysis: string;
  knowledgePoints: string[];
  source: string;
};

type PackFromApi = {
  packId: string;
  title: string;
  color: string;
  description: string;
  questions: QuestionFromApi[];
};

const PACK_ICONS: Record<string, typeof Zap> = {
  electrochemistry: Zap,
  experiment: FlaskConical,
  organic: Hexagon,
  'gaokao-choices': ClipboardList,
};

export function TrainingPackPage() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const [pack, setPack] = useState<PackFromApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!packId) return;
    api<PackFromApi>(`/training/packs/${packId}`)
      .then(setPack)
      .catch(() => {
        // Fallback to static data
        const staticPack = TRAINING_PACKS.find((p) => p.id === packId);
        if (staticPack) {
          setPack({
            packId: staticPack.id,
            title: staticPack.title,
            color: staticPack.color,
            description: staticPack.description,
            questions: staticPack.questions.map((q) => ({
              id: q.id,
              title: q.title,
              type: q.type,
              prompt: q.prompt,
              options: q.options ?? null,
              answer: q.answer,
              analysis: q.analysis,
              knowledgePoints: q.knowledgePoints,
              source: q.source,
            })),
          });
        }
      })
      .finally(() => setLoading(false));
  }, [packId]);

  if (loading) {
    return (
      <div className="container training-pack-page" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!pack) {
    return (
      <div className="container training-pack-page">
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' }}>
          未找到该题包
        </p>
      </div>
    );
  }

  const Icon = PACK_ICONS[pack.packId] ?? ClipboardList;

  const toggleAnswer = (questionId: string) => {
    setRevealedAnswers((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  return (
    <div className="container training-pack-page">
      <motion.header
        className="pack-page-header"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <button type="button" className="pack-back-btn" onClick={() => navigate('/training')}>
          <ArrowLeft size={18} strokeWidth={2} />
          <span>返回题包列表</span>
        </button>
        <div className="pack-page-title-row">
          <div
            className="pack-page-icon"
            style={{ background: `${pack.color}15`, color: pack.color }}
          >
            <Icon size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h1>{pack.title}</h1>
            <p className="pack-page-desc">{pack.description}</p>
          </div>
          <div className="pack-page-meta">
            <BookOpenCheck size={18} strokeWidth={1.8} />
            <span>{pack.questions.length} 题</span>
          </div>
        </div>
      </motion.header>

      <div className="pack-question-list">
        {pack.questions.map((question, index) => {
          const isRevealed = revealedAnswers.has(question.id);
          return (
            <motion.details
              key={question.id}
              className="training-question"
              open={index === 0}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] as const }}
            >
              <summary className="training-question-summary">
                <div className="training-question-summary-main">
                  <span className="training-question-index">第 {index + 1} 题</span>
                  <div>
                    <h3>{question.title}</h3>
                    <p>{question.type}</p>
                  </div>
                </div>
                <ChevronDown className="training-question-arrow" size={18} strokeWidth={1.8} />
              </summary>
              <div className="training-question-body">
                <div className="training-question-block">
                  <h4>题目</h4>
                  <p className="training-question-text">{question.prompt}</p>
                  {question.options && (
                    <ul className="training-options">
                      {question.options.map((option) => (
                        <li key={option.key}>
                          <span className="training-option-key">{option.key}.</span>
                          <span>{option.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  className="pack-reveal-btn"
                  onClick={() => toggleAnswer(question.id)}
                >
                  {isRevealed ? (
                    <EyeOff size={16} strokeWidth={2} />
                  ) : (
                    <Eye size={16} strokeWidth={2} />
                  )}
                  <span>{isRevealed ? '隐藏答案' : '查看答案'}</span>
                </button>
                {isRevealed && (
                  <motion.div
                    className="pack-answer-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as const }}
                  >
                    <div className="training-answer-grid">
                      <div className="training-question-block training-answer-card">
                        <h4>答案</h4>
                        <p className="training-answer-text">{question.answer}</p>
                      </div>
                      <div className="training-question-block training-source-card">
                        <h4>来源</h4>
                        <p>{question.source}</p>
                        <div className="training-points">
                          {question.knowledgePoints.map((point) => (
                            <span key={point} className="training-point">{point}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="training-question-block">
                      <h4>解析</h4>
                      <p className="training-question-text">{question.analysis}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.details>
          );
        })}
      </div>
      <style>{`
        .training-pack-page { padding-bottom: 2rem; }
        .pack-page-header { margin-bottom: 1.5rem; }
        .pack-back-btn {
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
          margin-bottom: 1.25rem;
        }
        .pack-back-btn:hover {
          border-color: var(--primary);
          color: var(--primary);
          background: var(--primary-light);
        }
        .pack-page-title-row {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .pack-page-icon {
          width: 46px;
          height: 46px;
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pack-page-title-row h1 {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.15rem;
        }
        .pack-page-desc {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .pack-page-meta {
          margin-left: auto;
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 0.8rem;
          border-radius: 999px;
          background: var(--primary-light);
          color: var(--primary);
          font-size: 0.84rem;
          font-weight: 600;
          white-space: nowrap;
        }
        .pack-question-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .pack-reveal-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 1rem;
          border-radius: var(--radius-sm);
          border: 1px solid rgba(79, 110, 247, 0.2);
          background: rgba(79, 110, 247, 0.06);
          color: var(--primary);
          font-size: 0.86rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--duration) var(--ease);
          align-self: flex-start;
        }
        .pack-reveal-btn:hover {
          background: rgba(79, 110, 247, 0.12);
          border-color: rgba(79, 110, 247, 0.35);
        }
        .pack-answer-section {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          overflow: hidden;
        }
        .training-question {
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: #fff;
          overflow: hidden;
        }
        .training-question[open] {
          border-color: rgba(79, 110, 247, 0.18);
          box-shadow: 0 8px 24px rgba(79, 110, 247, 0.06);
        }
        .training-question-summary {
          list-style: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 1rem 1.1rem;
        }
        .training-question-summary::-webkit-details-marker { display: none; }
        .training-question-summary-main {
          display: flex;
          align-items: flex-start;
          gap: 0.9rem;
        }
        .training-question-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 4.25rem;
          padding: 0.25rem 0.55rem;
          border-radius: 999px;
          background: var(--bg-subtle);
          color: var(--text-secondary);
          font-size: 0.76rem;
          font-weight: 600;
        }
        .training-question-summary h3 {
          font-size: 1rem;
          color: var(--text);
          margin-bottom: 0.15rem;
        }
        .training-question-summary p {
          color: var(--text-muted);
          font-size: 0.82rem;
        }
        .training-question-arrow {
          color: var(--text-muted);
          transition: transform var(--duration) var(--ease);
          flex-shrink: 0;
        }
        .training-question[open] .training-question-arrow {
          transform: rotate(180deg);
        }
        .training-question-body {
          padding: 0 1.1rem 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .training-question-block {
          padding: 1rem;
          border-radius: var(--radius);
          background: #fafbff;
          border: 1px solid var(--border-light);
        }
        .training-question-block h4 {
          font-size: 0.84rem;
          color: var(--text-secondary);
          margin-bottom: 0.55rem;
        }
        .training-question-text {
          color: var(--text);
          white-space: pre-line;
          line-height: 1.75;
        }
        .training-options {
          list-style: none;
          margin-top: 0.8rem;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
        }
        .training-options li {
          display: flex;
          gap: 0.45rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .training-option-key {
          color: var(--text);
          font-weight: 600;
          min-width: 1.4rem;
        }
        .training-answer-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.9rem;
        }
        .training-answer-card {
          background: #f8fffb;
          border-color: rgba(16, 185, 129, 0.16);
        }
        .training-source-card {
          background: #fffaf5;
          border-color: rgba(245, 158, 11, 0.18);
        }
        .training-answer-text {
          color: var(--text);
          white-space: pre-line;
          line-height: 1.7;
          font-weight: 500;
        }
        .training-points {
          margin-top: 0.8rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
        }
        .training-point {
          display: inline-flex;
          align-items: center;
          padding: 0.24rem 0.58rem;
          border-radius: 999px;
          background: rgba(245, 158, 11, 0.12);
          color: #b45309;
          font-size: 0.75rem;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .pack-page-title-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .pack-page-meta { margin-left: 0; }
          .training-answer-grid { grid-template-columns: 1fr; }
          .training-question-summary {
            flex-direction: column;
            align-items: flex-start;
          }
          .training-question-summary-main { width: 100%; }
        }
      `}</style>
    </div>
  );
}
