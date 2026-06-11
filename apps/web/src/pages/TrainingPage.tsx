import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpenCheck,
  ChevronDown,
  ClipboardList,
  Dumbbell,
  FlaskConical,
  Hexagon,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  TRAINING_PACKS,
  TRAINING_SOURCE_NOTE,
  type TrainingPackId,
} from '../lib/training-packs';

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

const PACK_ICONS: Record<TrainingPackId, typeof Zap> = {
  electrochemistry: Zap,
  experiment: FlaskConical,
  organic: Hexagon,
  'gaokao-choices': ClipboardList,
};

export function TrainingPage() {
  const [activePackId, setActivePackId] = useState<TrainingPackId>(TRAINING_PACKS[0].id);
  const activePack = TRAINING_PACKS.find((pack) => pack.id === activePackId) ?? TRAINING_PACKS[0];

  return (
    <div className="container training-page">
      <motion.header
        className="training-header"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <div className="training-header-icon">
          <Dumbbell size={24} strokeWidth={1.6} />
        </div>
        <div>
          <h1>专题训练包</h1>
          <p className="training-header-desc">针对高考重点专题，集中突破薄弱环节</p>
        </div>
      </motion.header>

      <div className="training-source-note">
        <Sparkles size={16} strokeWidth={1.8} />
        <span>{TRAINING_SOURCE_NOTE}</span>
      </div>

      <motion.div
        className="training-grid"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {TRAINING_PACKS.map((pack) => {
          const Icon = PACK_ICONS[pack.id];
          const isActive = pack.id === activePackId;

          return (
            <motion.section
              key={pack.id}
              className={`card training-card ${isActive ? 'training-card-active' : ''}`}
              variants={childVariant}
            >
              <div className="training-card-accent" style={{ background: pack.color }} />
              <div className="training-card-head">
                <div
                  className="training-card-icon"
                  style={{ background: `${pack.color}15`, color: pack.color }}
                >
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <div className="training-card-title-wrap">
                  <h3>{pack.title}</h3>
                  <span className="training-card-type">专题包</span>
                </div>
              </div>
              <p className="training-card-desc">{pack.description}</p>
              <div className="training-card-tags">
                {pack.tags.map((tag) => (
                  <span key={tag} className="training-tag">
                    {tag}
                  </span>
                ))}
              </div>
              <div className="training-card-footer">
                <span className="training-count">{pack.questions.length} 道真题改编题</span>
                <button
                  type="button"
                  className="btn btn-primary training-start-btn"
                  onClick={() => setActivePackId(pack.id)}
                >
                  <Play size={14} strokeWidth={2.5} />
                  {isActive ? '当前题包' : '查看题目'}
                </button>
              </div>
            </motion.section>
          );
        })}
      </motion.div>

      <motion.section
        key={activePack.id}
        className="card training-detail"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] as const }}
      >
        <div className="training-detail-head">
          <div>
            <p className="training-detail-kicker">当前训练</p>
            <h2>{activePack.title}</h2>
            <p className="training-detail-desc">{activePack.description}</p>
          </div>
          <div className="training-detail-meta">
            <BookOpenCheck size={18} strokeWidth={1.8} />
            <span>{activePack.questions.length} 题</span>
          </div>
        </div>

        <div className="training-question-list">
          {activePack.questions.map((question, index) => (
            <details key={question.id} className="training-question" open={index === 0}>
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
                        <span key={point} className="training-point">
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="training-question-block">
                  <h4>解析</h4>
                  <p className="training-question-text">{question.analysis}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </motion.section>

      <style>{`
        .training-page { padding-bottom: 2rem; }
        .training-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .training-header-icon {
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
        .training-header h1 {
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--text);
          margin-bottom: 0.15rem;
        }
        .training-header-desc {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
        .training-source-note {
          margin-bottom: 1.5rem;
          padding: 0.9rem 1rem;
          border-radius: var(--radius);
          border: 1px solid rgba(79, 110, 247, 0.14);
          background: linear-gradient(135deg, #f8faff 0%, #f2f6ff 100%);
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          color: var(--text-secondary);
          font-size: 0.88rem;
        }
        .training-source-note svg {
          color: var(--primary);
          flex-shrink: 0;
          margin-top: 0.1rem;
        }
        .training-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .training-card {
          position: relative;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          overflow: hidden;
          transition: transform var(--duration) var(--ease), box-shadow var(--duration) var(--ease), border-color var(--duration) var(--ease);
        }
        .training-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
        }
        .training-card-active {
          border-color: rgba(79, 110, 247, 0.26);
          box-shadow: 0 10px 30px rgba(79, 110, 247, 0.08);
        }
        .training-card-accent {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          border-radius: 4px 0 0 4px;
        }
        .training-card-head {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .training-card-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .training-card-title-wrap {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .training-card-head h3 {
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text);
        }
        .training-card-type {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        .training-card-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
          line-height: 1.6;
          min-height: 2.8rem;
        }
        .training-card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .training-tag {
          padding: 0.2rem 0.6rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          background: var(--primary-light);
          color: var(--primary);
        }
        .training-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 0.8rem;
          border-top: 1px solid var(--border-light);
          gap: 0.75rem;
        }
        .training-count {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .training-start-btn {
          padding: 0.45rem 0.9rem;
          font-size: 0.82rem;
          border-radius: var(--radius-sm);
          white-space: nowrap;
        }
        .training-detail {
          padding: 1.5rem;
        }
        .training-detail-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-light);
        }
        .training-detail-kicker {
          font-size: 0.78rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--primary);
          font-weight: 700;
          margin-bottom: 0.35rem;
        }
        .training-detail-head h2 {
          font-size: 1.25rem;
          color: var(--text);
          margin-bottom: 0.2rem;
        }
        .training-detail-desc {
          color: var(--text-muted);
          font-size: 0.92rem;
        }
        .training-detail-meta {
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
        .training-question-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
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
        .training-question-summary::-webkit-details-marker {
          display: none;
        }
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
          .training-detail-head,
          .training-card-footer,
          .training-question-summary {
            flex-direction: column;
            align-items: flex-start;
          }
          .training-answer-grid {
            grid-template-columns: 1fr;
          }
          .training-question-summary-main {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
