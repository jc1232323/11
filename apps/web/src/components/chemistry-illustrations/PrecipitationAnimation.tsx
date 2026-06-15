import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 沉淀反应 — 离子相遇生成沉淀下落 */
export function PrecipitationAnimation() {
  return (
    <IllustrationCard title="沉淀反应：Ag⁺ + Cl⁻ → AgCl↓">
      <svg viewBox="-120 -80 240 170" width="100%" height="180">
        {/* 溶液背景 */}
        <rect x="-100" y="-65" width="200" height="145" rx="10" fill="rgba(59,130,246,0.05)" />

        {/* Ag⁺ 从左边来 */}
        <motion.g
          initial={{ x: -70 }}
          animate={{ x: [-70, -5] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2.5, repeatType: 'reverse' }}
        >
          <circle r="14" fill="rgba(156,163,175,0.85)" />
          <text textAnchor="middle" dy="4" fontSize="9" fontWeight="bold" fill="white">Ag⁺</text>
        </motion.g>

        {/* Cl⁻ 从右边来 */}
        <motion.g
          initial={{ x: 70 }}
          animate={{ x: [70, 5] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2.5, repeatType: 'reverse' }}
        >
          <circle r="14" fill="rgba(16,185,129,0.85)" />
          <text textAnchor="middle" dy="4" fontSize="9" fontWeight="bold" fill="white">Cl⁻</text>
        </motion.g>

        {/* AgCl 沉淀生成并下落 */}
        <motion.g
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: [0, 0, 1, 1, 1],
            y: [0, 0, 0, 45, 50],
          }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.35, 0.4, 0.7, 1] }}
        >
          <rect x="-12" y="-8" width="24" height="16" rx="3" fill="#d1d5db" stroke="#9ca3af" strokeWidth="1.5" />
          <text textAnchor="middle" dy="4" fontSize="7" fontWeight="bold" fill="#4b5563">AgCl</text>
        </motion.g>

        {/* 底部沉淀层 */}
        <motion.rect
          x="-60" y="55" width="120" height="12" rx="4"
          fill="#d1d5db"
          opacity="0.6"
          initial={{ width: 60, x: -30 }}
          animate={{ width: [60, 120], x: [-30, -60] }}
          transition={{ duration: 4, repeat: Infinity, repeatDelay: 0 }}
        />

        {/* 下落箭头标注 */}
        <motion.text
          x="65" y="45"
          fontSize="16"
          fill="var(--text-muted, #64748b)"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.5, 0.8, 1] }}
        >
          ↓
        </motion.text>
      </svg>
    </IllustrationCard>
  );
}
