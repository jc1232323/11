import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 氧化还原反应 — 电子转移动画 */
export function RedoxAnimation() {
  const electrons = [0, 1, 2];

  return (
    <IllustrationCard title="氧化还原反应：电子从还原剂转移到氧化剂">
      <svg viewBox="-130 -70 260 140" width="100%" height="160">
        {/* 还原剂 */}
        <circle cx="-60" cy="0" r="30" fill="rgba(239,68,68,0.12)" stroke="#ef4444" strokeWidth="2" />
        <text x="-60" y="-2" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#ef4444">还原剂</text>
        <text x="-60" y="12" textAnchor="middle" fontSize="8" fill="#ef4444">失去电子</text>

        {/* 氧化剂 */}
        <circle cx="60" cy="0" r="30" fill="rgba(59,130,246,0.12)" stroke="#3b82f6" strokeWidth="2" />
        <text x="60" y="-2" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#3b82f6">氧化剂</text>
        <text x="60" y="12" textAnchor="middle" fontSize="8" fill="#3b82f6">得到电子</text>

        {/* 箭头路径 */}
        <path d="M -25 -20 Q 0 -45 25 -20" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" opacity="0.5" />

        {/* 电子转移 */}
        {electrons.map((i) => (
          <motion.g key={i}>
            <motion.circle
              r="5"
              fill="#fbbf24"
              stroke="#f59e0b"
              strokeWidth="1"
              initial={{ cx: -30, cy: -15 }}
              animate={{
                cx: [-30, 0, 30],
                cy: [-15, -35 - i * 5, -15],
              }}
              transition={{
                duration: 1.8,
                delay: i * 0.4,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
            />
            <motion.text
              fontSize="7"
              fill="#92400e"
              fontWeight="bold"
              textAnchor="middle"
              initial={{ x: -30, y: -12 }}
              animate={{
                x: [-30, 0, 30],
                y: [-12, -32 - i * 5, -12],
              }}
              transition={{
                duration: 1.8,
                delay: i * 0.4,
                repeat: Infinity,
                repeatDelay: 2,
                ease: 'easeInOut',
              }}
            >
              e⁻
            </motion.text>
          </motion.g>
        ))}

        {/* 标注 */}
        <text x="-60" y="50" textAnchor="middle" fontSize="9" fill="var(--text-muted, #64748b)">
          氧化反应
        </text>
        <text x="60" y="50" textAnchor="middle" fontSize="9" fill="var(--text-muted, #64748b)">
          还原反应
        </text>
      </svg>
    </IllustrationCard>
  );
}
