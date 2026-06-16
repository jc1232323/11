import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 影响反应速率 — 粒子碰撞频率动画 */
export function ReactionRateAnimation() {
  // 低温/低浓度的粒子
  const slowParticles = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    x1: -80 + Math.random() * 60,
    y1: -40 + Math.random() * 80,
    x2: -80 + Math.random() * 60,
    y2: -40 + Math.random() * 80,
  }));

  // 高温/高浓度的粒子
  const fastParticles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x1: 20 + Math.random() * 60,
    y1: -40 + Math.random() * 80,
    x2: 20 + Math.random() * 60,
    y2: -40 + Math.random() * 80,
  }));

  return (
    <IllustrationCard title="温度升高 / 浓度增大 → 碰撞频率增加 → 速率加快">
      <svg viewBox="-110 -65 220 130" width="100%" height="150">
        {/* 左框 - 低速 */}
        <rect x="-100" y="-50" width="90" height="100" rx="8" fill="rgba(59,130,246,0.06)" stroke="#93c5fd" strokeWidth="1" />
        <text x="-55" y="-55" textAnchor="middle" fontSize="9" fill="#64748b">低温 / 低浓度</text>

        {slowParticles.map((p) => (
          <motion.circle
            key={`s-${p.id}`}
            r="5"
            fill="#93c5fd"
            animate={{
              cx: [p.x1, p.x2, p.x1],
              cy: [p.y1, p.y2, p.y1],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* 右框 - 高速 */}
        <rect x="10" y="-50" width="90" height="100" rx="8" fill="rgba(239,68,68,0.06)" stroke="#fca5a5" strokeWidth="1" />
        <text x="55" y="-55" textAnchor="middle" fontSize="9" fill="#64748b">高温 / 高浓度</text>

        {fastParticles.map((p) => (
          <motion.circle
            key={`f-${p.id}`}
            r="5"
            fill="#f87171"
            animate={{
              cx: [p.x1, p.x2, p.x1],
              cy: [p.y1, p.y2, p.y1],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        ))}

        {/* 碰撞闪光 */}
        <motion.circle
          cx="55" cy="0" r="3"
          fill="#fbbf24"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
        />
        <motion.circle
          cx="40" cy="15" r="3"
          fill="#fbbf24"
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
          transition={{ duration: 0.8, delay: 0.4, repeat: Infinity, repeatDelay: 0.5 }}
        />
      </svg>
    </IllustrationCard>
  );
}
