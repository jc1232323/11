import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 离子键与共价键 — 电子转移 vs 共享对比 */
export function IonicCovalentBondAnimation() {
  return (
    <IllustrationCard title="离子键（电子转移）与共价键（电子共享）">
      <svg viewBox="-140 -75 280 150" width="100%" height="160">
        {/* 左侧：离子键 */}
        <text x="-70" y="-60" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--text, #1e293b)">
          离子键
        </text>

        {/* Na 原子 */}
        <circle cx="-95" cy="0" r="20" fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="1.5" />
        <text x="-95" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ef4444">Na</text>

        {/* Cl 原子 */}
        <circle cx="-45" cy="0" r="22" fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="1.5" />
        <text x="-45" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#10b981">Cl</text>

        {/* 电子转移动画 */}
        <motion.circle
          r="4"
          fill="#fbbf24"
          initial={{ cx: -80, cy: -8 }}
          animate={{ cx: [-80, -60], cy: [-8, -8] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1 }}
        />
        <motion.text
          fontSize="12"
          fill="var(--text-muted, #64748b)"
          x="-70" y="8"
          textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          →
        </motion.text>

        {/* 分隔线 */}
        <line x1="0" y1="-65" x2="0" y2="60" stroke="var(--border-light, #e2e8f0)" strokeWidth="1" strokeDasharray="4 3" />

        {/* 右侧：共价键 */}
        <text x="70" y="-60" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--text, #1e293b)">
          共价键
        </text>

        {/* H 原子 1 */}
        <circle cx="45" cy="0" r="18" fill="rgba(79,110,247,0.12)" stroke="#4f6ef7" strokeWidth="1.5" />
        <text x="45" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4f6ef7">H</text>

        {/* H 原子 2 */}
        <circle cx="95" cy="0" r="18" fill="rgba(79,110,247,0.12)" stroke="#4f6ef7" strokeWidth="1.5" />
        <text x="95" y="4" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4f6ef7">H</text>

        {/* 共享电子对 */}
        <motion.g
          animate={{ x: [-2, 2, -2] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx="67" cy="-4" r="4" fill="#fbbf24" />
          <circle cx="73" cy="4" r="4" fill="#fbbf24" />
        </motion.g>

        {/* 共享区域高亮 */}
        <motion.ellipse
          cx="70" cy="0" rx="12" ry="16"
          fill="rgba(251,191,36,0.15)"
          stroke="#fbbf24"
          strokeWidth="1"
          strokeDasharray="3 2"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* 底部标注 */}
        <text x="-70" y="45" textAnchor="middle" fontSize="8" fill="var(--text-muted, #64748b)">
          Na → Na⁺ + e⁻
        </text>
        <text x="70" y="45" textAnchor="middle" fontSize="8" fill="var(--text-muted, #64748b)">
          共用电子对
        </text>
      </svg>
    </IllustrationCard>
  );
}
