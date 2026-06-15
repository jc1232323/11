import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 烷烃与烯烃 — 分子结构 + 加成反应 */
export function AlkanesAlkenesAnimation() {
  return (
    <IllustrationCard title="烯烃的加成反应：双键打开，与 Br₂ 加成">
      <svg viewBox="-130 -70 260 145" width="100%" height="155">
        {/* 乙烯分子 */}
        <text x="-65" y="-55" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--text, #1e293b)">
          乙烯 CH₂=CH₂
        </text>

        {/* C=C 双键 */}
        <circle cx="-80" cy="-10" r="14" fill="rgba(79,110,247,0.15)" stroke="#4f6ef7" strokeWidth="1.5" />
        <text x="-80" y="-7" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4f6ef7">C</text>

        <circle cx="-50" cy="-10" r="14" fill="rgba(79,110,247,0.15)" stroke="#4f6ef7" strokeWidth="1.5" />
        <text x="-50" y="-7" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4f6ef7">C</text>

        {/* 双键线 */}
        <line x1="-66" y1="-14" x2="-64" y2="-14" stroke="#4f6ef7" strokeWidth="2" />
        <line x1="-66" y1="-6" x2="-64" y2="-6" stroke="#4f6ef7" strokeWidth="2" />

        {/* H 原子 */}
        <text x="-97" y="-20" fontSize="8" fill="#64748b">H</text>
        <text x="-97" y="5" fontSize="8" fill="#64748b">H</text>
        <text x="-37" y="-20" fontSize="8" fill="#64748b">H</text>
        <text x="-37" y="5" fontSize="8" fill="#64748b">H</text>

        {/* + Br₂ */}
        <motion.text
          x="-65" y="25"
          textAnchor="middle" fontSize="10" fill="var(--text-muted, #64748b)"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          + Br₂
        </motion.text>

        {/* 箭头 */}
        <motion.path
          d="M -20 -10 L 10 -10"
          fill="none"
          stroke="var(--text-muted, #64748b)"
          strokeWidth="1.5"
          markerEnd="url(#arrowR)"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* 产物 CH₂BrCH₂Br */}
        <text x="70" y="-55" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--text, #1e293b)">
          1,2-二溴乙烷
        </text>

        <circle cx="50" cy="-10" r="14" fill="rgba(79,110,247,0.15)" stroke="#4f6ef7" strokeWidth="1.5" />
        <text x="50" y="-7" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4f6ef7">C</text>

        <circle cx="90" cy="-10" r="14" fill="rgba(79,110,247,0.15)" stroke="#4f6ef7" strokeWidth="1.5" />
        <text x="90" y="-7" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4f6ef7">C</text>

        {/* 单键 */}
        <line x1="64" y1="-10" x2="76" y2="-10" stroke="#4f6ef7" strokeWidth="2" />

        {/* Br 原子 - 加成到碳上 */}
        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, repeat: Infinity, repeatType: 'reverse', repeatDelay: 2 }}
        >
          <circle cx="50" cy="18" r="10" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="1.5" />
          <text x="50" y="22" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ef4444">Br</text>
        </motion.g>

        <motion.g
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, repeat: Infinity, repeatType: 'reverse', repeatDelay: 2 }}
        >
          <circle cx="90" cy="18" r="10" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="1.5" />
          <text x="90" y="22" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#ef4444">Br</text>
        </motion.g>

        {/* 鉴别提示 */}
        <motion.text
          x="0" y="58" textAnchor="middle" fontSize="8" fill="#10b981"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          溴水褪色 → 含碳碳双键
        </motion.text>

        <defs>
          <marker id="arrowR" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="var(--text-muted, #64748b)" />
          </marker>
        </defs>
      </svg>
    </IllustrationCard>
  );
}
