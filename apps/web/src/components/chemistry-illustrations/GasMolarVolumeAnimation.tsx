import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 气体摩尔体积 — 气球膨胀 + 分子运动 */
export function GasMolarVolumeAnimation() {
  const molecules = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    startX: (Math.random() - 0.5) * 40,
    startY: (Math.random() - 0.5) * 40,
    endX: (Math.random() - 0.5) * 60,
    endY: (Math.random() - 0.5) * 60,
  }));

  return (
    <IllustrationCard title="标准状况下，1 mol 任何气体体积为 22.4 L">
      <svg viewBox="-120 -90 240 180" width="100%" height="180">
        {/* 气球轮廓 - 膨胀动画 */}
        <motion.ellipse
          cx="0" cy="-10"
          fill="rgba(79, 110, 247, 0.08)"
          stroke="var(--primary, #4f6ef7)"
          strokeWidth="2"
          initial={{ rx: 20, ry: 25 }}
          animate={{ rx: [20, 65, 60], ry: [25, 72, 68] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, repeatType: 'reverse' }}
        />

        {/* 气球底部尖角 */}
        <motion.path
          d="M -6 58 L 0 72 L 6 58"
          fill="none"
          stroke="var(--primary, #4f6ef7)"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        />

        {/* 内部运动分子 */}
        {molecules.map((m) => (
          <motion.circle
            key={m.id}
            r="4"
            fill="var(--primary, #4f6ef7)"
            opacity="0.6"
            initial={{ cx: m.startX, cy: m.startY - 10 }}
            animate={{
              cx: [m.startX, m.endX, m.startX],
              cy: [m.startY - 10, m.endY - 10, m.startY - 10],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}

        {/* 体积标注 */}
        <motion.text
          x="0" y="-10"
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill="var(--primary, #4f6ef7)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 1 }}
        >
          22.4 L
        </motion.text>
      </svg>
    </IllustrationCard>
  );
}
