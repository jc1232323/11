import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  Dumbbell,
  FlaskConical,
  Hexagon,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import {
  TRAINING_SOURCE_NOTE,
  getTrainingPackSummaries,
  type TrainingPackId,
  type TrainingPackSummary,
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
  const navigate = useNavigate();
  const [packs, setPacks] = useState<TrainingPackSummary[]>(() => getTrainingPackSummaries());

  useEffect(() => {
    const fallbackPacks = getTrainingPackSummaries();

    api<TrainingPackSummary[]>('/training/packs')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPacks(data);
          return;
        }

        setPacks(fallbackPacks);
      })
      .catch(() => {
        setPacks(fallbackPacks);
      });
  }, []);

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
        {packs.length === 0 && (
          <div className="training-empty-state">
            题包数据暂未就绪，请稍后重试。
          </div>
        )}
        {packs.map((pack) => {
          const Icon = PACK_ICONS[pack.packId as TrainingPackId] ?? ClipboardList;

          return (
            <motion.section
              key={pack.packId}
              className="card training-card"
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
                <span className="training-count">{pack.questionCount} 道真题改编题</span>
                <button
                  type="button"
                  className="btn btn-primary training-start-btn"
                  onClick={() => navigate(`/training/${pack.packId}`)}
                >
                  <Play size={14} strokeWidth={2.5} />
                  开始训练
                </button>
              </div>
            </motion.section>
          );
        })}
      </motion.div>

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
        .training-empty-state {
          grid-column: 1 / -1;
          padding: 1.25rem;
          border: 1px dashed rgba(148, 163, 184, 0.45);
          border-radius: var(--radius);
          background: rgba(248, 250, 252, 0.9);
          color: var(--text-muted);
          text-align: center;
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
        @media (max-width: 768px) {
          .training-card-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
