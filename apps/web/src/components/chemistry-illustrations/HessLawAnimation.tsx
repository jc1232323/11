import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 盖斯定律 — 多路径能量守恒 */
export function HessLawAnimation() {
  return (
    <IllustrationCard title="盖斯定律：反应热只与始态和终态有关，与途径无关">
      <svg viewBox="-120 -70 240 140" width="100%" height="150">
        {/* 起点A */}
        <circle cx="-80" cy="-30" r="20" fill="rgba(79,110,247,0.12)" stroke="#4f6ef7" strokeWidth="1.5" />
        <text x="-80" y="-27" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#4f6ef7">A</text>

        {/* 终点C */}
        <circle cx="80" cy="-30" r="20" fill="rgba(16,185,129,0.12)" stroke="#10b981" strokeWidth="1.5" />
        <text x="80" y="-27" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#10b981">C</text>

        {/* 中间态B */}
        <circle cx="0" cy="40" r="16" fill="rgba(245,158,11,0.12)" stroke="#f59e0b" strokeWidth="1.5" />
        <text x="0" y="43" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#f59e0b">B</text>

        {/* 路径1：直接 A → C */}
        <motion.path
          d="M -58 -30 L 58 -30"
          fill="none" stroke="#4f6ef7" strokeWidth="2"
          strokeDasharray="4 2"
          animate={{ strokeDashoffset: [0, -12] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <text x="0" y="-38" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4f6ef7">ΔH</text>

        {/* 路径2：A → B */}
        <motion.path
          d="M -65 -15 L -12 32"
          fill="none" stroke="#f59e0b" strokeWidth="1.5"
          strokeDasharray="4 2"
          animate={{ strokeDashoffset: [0, -12] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <text x="-45" y="18" fontSize="8" fill="#f59e0b">ΔH₁</text>

        {/* 路径2：B → C */}
        <motion.path
          d="M 12 32 L 65 -15"
          fill="none" stroke="#f59e0b" strokeWidth="1.5"
          strokeDasharray="4 2"
          animate={{ strokeDashoffset: [0, -12] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />
        <text x="45" y="18" fontSize="8" fill="#f59e0b">ΔH₂</text>

        {/* 等式 */}
        <motion.text
          x="0" y="68"
          textAnchor="middle" fontSize="10" fontWeight="bold"
          fill="var(--text, #1e293b)"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ΔH = ΔH₁ + ΔH₂
        </motion.text>

        {/* 箭头 */}
        <polygon points="58,-30 52,-26 52,-34" fill="#4f6ef7" />
        <polygon points="-12,32 -6,25 -16,26" fill="#f59e0b" />
        <polygon points="65,-15 58,-12 60,-21" fill="#f59e0b" />
      </svg>
    </IllustrationCard>
  );
}
