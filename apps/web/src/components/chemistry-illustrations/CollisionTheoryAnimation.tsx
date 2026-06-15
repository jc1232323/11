import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 碰撞理论 — 有效碰撞 vs 无效碰撞 */
export function CollisionTheoryAnimation() {
  return (
    <IllustrationCard title="只有能量足够且取向正确的碰撞才是有效碰撞">
      <svg viewBox="-130 -70 260 140" width="100%" height="155">
        {/* 左侧：无效碰撞 */}
        <text x="-65" y="-55" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ef4444">✗ 无效碰撞</text>

        <motion.circle
          r="12" fill="rgba(148,163,184,0.7)"
          animate={{ cx: [-95, -55, -95], cy: [0, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          r="12" fill="rgba(148,163,184,0.7)"
          animate={{ cx: [-35, -75, -35], cy: [0, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* 弹开符号 */}
        <motion.text
          x="-65" y="5" textAnchor="middle" fontSize="14"
          animate={{ opacity: [0, 0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, times: [0, 0.45, 0.5, 0.7] }}
          fill="#ef4444"
        >
          ✕
        </motion.text>

        <text x="-65" y="40" textAnchor="middle" fontSize="8" fill="var(--text-muted, #64748b)">
          能量不足/取向不对
        </text>

        {/* 分隔 */}
        <line x1="0" y1="-60" x2="0" y2="55" stroke="var(--border-light, #e2e8f0)" strokeWidth="1" strokeDasharray="4 3" />

        {/* 右侧：有效碰撞 */}
        <text x="65" y="-55" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#10b981">✓ 有效碰撞</text>

        <motion.circle
          r="12" fill="rgba(79,110,247,0.8)"
          animate={{ cx: [35, 58, 35], cy: [0, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.circle
          r="12" fill="rgba(245,158,11,0.8)"
          animate={{ cx: [95, 72, 95], cy: [0, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* 反应产物闪光 */}
        <motion.g
          animate={{ opacity: [0, 0, 1, 0], scale: [0.5, 0.5, 1.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, times: [0, 0.45, 0.55, 0.8] }}
        >
          <circle cx="65" cy="0" r="6" fill="#fbbf24" opacity="0.6" />
          <circle cx="65" cy="0" r="10" fill="none" stroke="#fbbf24" strokeWidth="1" />
        </motion.g>

        <motion.text
          x="65" y="5" textAnchor="middle" fontSize="10" fontWeight="bold"
          animate={{ opacity: [0, 0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, times: [0, 0.5, 0.55, 0.85] }}
          fill="#10b981"
        >
          ✓
        </motion.text>

        <text x="65" y="40" textAnchor="middle" fontSize="8" fill="var(--text-muted, #64748b)">
          能量足够 + 正确取向
        </text>
      </svg>
    </IllustrationCard>
  );
}
