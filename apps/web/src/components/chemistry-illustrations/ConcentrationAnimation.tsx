import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 物质的量浓度 — 配制溶液过程动画 */
export function ConcentrationAnimation() {
  return (
    <IllustrationCard title="物质的量浓度 c = n/V（配制溶液步骤）">
      <svg viewBox="-130 -70 260 145" width="100%" height="155">
        {/* 容量瓶轮廓 */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* 瓶身 */}
          <path
            d="M -15 -40 L -15 -20 Q -15 -15 -25 0 L -30 50 Q -30 55 -25 55 L 25 55 Q 30 55 30 50 L 25 0 Q 15 -15 15 -20 L 15 -40"
            fill="none"
            stroke="var(--text-muted, #64748b)"
            strokeWidth="1.5"
          />
          {/* 瓶口 */}
          <line x1="-15" y1="-40" x2="15" y2="-40" stroke="var(--text-muted, #64748b)" strokeWidth="1.5" />
          {/* 刻度线 */}
          <line x1="-22" y1="20" x2="22" y2="20" stroke="#ef4444" strokeWidth="1" strokeDasharray="2 1" />
          <text x="28" y="23" fontSize="7" fill="#ef4444">刻度线</text>
        </motion.g>

        {/* 液面上升动画 */}
        <motion.rect
          x="-25" y="50" width="50" rx="2"
          fill="rgba(59,130,246,0.25)"
          initial={{ height: 0, y: 50 }}
          animate={{ height: [0, 30, 30], y: [50, 20, 20] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, repeatType: 'reverse' }}
        />

        {/* 溶质粒子 */}
        {[0, 1, 2, 3].map((i) => (
          <motion.circle
            key={i}
            r="3"
            fill="#4f6ef7"
            initial={{ opacity: 0 }}
            animate={{
              cx: [-5 + i * 4, -8 + i * 5, -5 + i * 4],
              cy: [40, 30, 40],
              opacity: [0, 0.8, 0.8],
            }}
            transition={{ duration: 3, delay: 1 + i * 0.2, repeat: Infinity, repeatDelay: 2, repeatType: 'reverse' }}
          />
        ))}

        {/* 右侧公式 */}
        <text x="80" y="-20" textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--primary, #4f6ef7)">
          c = n / V
        </text>
        <text x="80" y="0" textAnchor="middle" fontSize="8" fill="var(--text-muted, #64748b)">
          c: 浓度 (mol/L)
        </text>
        <text x="80" y="15" textAnchor="middle" fontSize="8" fill="var(--text-muted, #64748b)">
          n: 物质的量 (mol)
        </text>
        <text x="80" y="30" textAnchor="middle" fontSize="8" fill="var(--text-muted, #64748b)">
          V: 溶液体积 (L)
        </text>

        {/* 步骤提示 */}
        <motion.text
          x="0" y="68" textAnchor="middle" fontSize="7" fill="var(--text-muted, #64748b)"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          计算 → 称量 → 溶解 → 转移 → 定容 → 摇匀
        </motion.text>
      </svg>
    </IllustrationCard>
  );
}
