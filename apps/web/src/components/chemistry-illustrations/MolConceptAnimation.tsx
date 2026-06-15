import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 摩尔与阿伏伽德罗常数 — 粒子聚集动画 */
export function MolConceptAnimation() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.cos((i / 12) * Math.PI * 2) * 80,
    y: Math.sin((i / 12) * Math.PI * 2) * 60,
  }));

  return (
    <IllustrationCard title="1 mol 物质包含 6.02×10²³ 个粒子">
      <svg viewBox="-120 -90 240 180" width="100%" height="180">
        {/* 中心标签 */}
        <motion.text
          x="0" y="5"
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="var(--primary, #4f6ef7)"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          1 mol
        </motion.text>

        {/* 聚集的粒子 */}
        {particles.map((p) => (
          <motion.circle
            key={p.id}
            r="8"
            fill="var(--primary, #4f6ef7)"
            opacity="0.7"
            initial={{ cx: p.x * 1.5, cy: p.y * 1.5, opacity: 0 }}
            animate={{
              cx: [p.x * 1.5, p.x * 0.4],
              cy: [p.y * 1.5, p.y * 0.4],
              opacity: [0, 0.8],
            }}
            transition={{
              duration: 2,
              delay: p.id * 0.1,
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 1,
            }}
          />
        ))}

        {/* 虚线圆圈表示集合 */}
        <motion.circle
          cx="0" cy="0" r="55"
          fill="none"
          stroke="var(--primary, #4f6ef7)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        />
      </svg>
    </IllustrationCard>
  );
}
