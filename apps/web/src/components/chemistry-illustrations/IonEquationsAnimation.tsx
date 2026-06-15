import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 离子方程式 — 拆分过程动画 */
export function IonEquationsAnimation() {
  return (
    <IllustrationCard title="离子方程式书写：拆强电解质为离子，保留弱电解质和沉淀">
      <svg viewBox="-130 -65 260 130" width="100%" height="140">
        {/* 化学方程式 */}
        <text x="0" y="-48" textAnchor="middle" fontSize="9" fill="var(--text, #1e293b)">
          NaOH + HCl → NaCl + H₂O
        </text>

        {/* 箭头 */}
        <motion.path
          d="M 0 -38 L 0 -25"
          fill="none" stroke="var(--text-muted, #64748b)" strokeWidth="1.5"
          markerEnd="url(#arrowDown)"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* 拆分过程 */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {/* Na⁺ */}
          <motion.g animate={{ x: [-10, -50] }} transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatType: 'reverse', repeatDelay: 2 }}>
            <circle cx="-30" cy="-5" r="11" fill="rgba(148,163,184,0.3)" />
            <text x="-30" y="-2" textAnchor="middle" fontSize="7" fill="#64748b">Na⁺</text>
          </motion.g>

          {/* OH⁻ */}
          <motion.circle cx="-5" cy="-5" r="11" fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="-5" y="-2" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#3b82f6">OH⁻</text>

          {/* H⁺ */}
          <motion.circle cx="25" cy="-5" r="11" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="1.5" />
          <text x="25" y="-2" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#ef4444">H⁺</text>

          {/* Cl⁻ */}
          <motion.g animate={{ x: [10, 50] }} transition={{ duration: 1.5, delay: 1, repeat: Infinity, repeatType: 'reverse', repeatDelay: 2 }}>
            <circle cx="55" cy="-5" r="11" fill="rgba(148,163,184,0.3)" />
            <text x="55" y="-2" textAnchor="middle" fontSize="7" fill="#64748b">Cl⁻</text>
          </motion.g>
        </motion.g>

        {/* 反应结果 */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1] }}
          transition={{ duration: 3, repeat: Infinity, times: [0, 0.5, 0.7] }}
        >
          <text x="0" y="30" textAnchor="middle" fontSize="8" fill="var(--text-muted, #64748b)">
            ↓ 去掉旁观离子
          </text>
        </motion.g>

        {/* 最终离子方程式 */}
        <motion.text
          x="0" y="52"
          textAnchor="middle" fontSize="10" fontWeight="bold"
          fill="var(--primary, #4f6ef7)"
          animate={{ opacity: [0, 0, 0, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.6, 0.75] }}
        >
          OH⁻ + H⁺ → H₂O
        </motion.text>

        <defs>
          <marker id="arrowDown" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="var(--text-muted, #64748b)" />
          </marker>
        </defs>
      </svg>
    </IllustrationCard>
  );
}
