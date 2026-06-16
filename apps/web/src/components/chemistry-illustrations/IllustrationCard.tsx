import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  title?: string;
  children: ReactNode;
}

/** 通用动画容器卡片 — 统一样式和动画入场 */
export function IllustrationCard({ title, children }: Props) {
  return (
    <motion.figure
      className="chem-illust"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="chem-illust-canvas">{children}</div>
      {title && <figcaption className="chem-illust-caption">{title}</figcaption>}
      <style>{`
        .chem-illust {
          margin: 1.5rem 0;
          padding: 1.25rem;
          border-radius: var(--radius-lg, 12px);
          background: var(--bg-elevated, #f8fafc);
          border: 1px solid var(--border-light, #e2e8f0);
          overflow: hidden;
        }
        .chem-illust-canvas {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 180px;
          position: relative;
        }
        .chem-illust-caption {
          text-align: center;
          font-size: 0.82rem;
          color: var(--text-muted, #64748b);
          margin-top: 0.75rem;
          font-style: normal;
        }
        @media (prefers-color-scheme: dark) {
          .chem-illust {
            background: var(--bg-elevated, #1e293b);
            border-color: var(--border-light, #334155);
          }
        }
      `}</style>
    </motion.figure>
  );
}
