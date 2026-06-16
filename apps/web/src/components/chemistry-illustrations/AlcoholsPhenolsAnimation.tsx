import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 醇与酚 — 官能团特征动画 */
export function AlcoholsPhenolsAnimation() {
  return (
    <IllustrationCard title="醇 (-OH 连脂肪碳) 与酚 (-OH 连苯环) 对比">
      <svg viewBox="-130 -65 260 130" width="100%" height="140">
        {/* 左：醇 */}
        <text x="-65" y="-50" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--text, #1e293b)">
          醇 (乙醇)
        </text>

        {/* CH₃-CH₂ 骨架 */}
        <circle cx="-85" cy="0" r="14" fill="rgba(79,110,247,0.12)" stroke="#4f6ef7" strokeWidth="1.5" />
        <text x="-85" y="4" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4f6ef7">CH₃</text>

        <line x1="-71" y1="0" x2="-59" y2="0" stroke="#4f6ef7" strokeWidth="2" />

        <circle cx="-45" cy="0" r="14" fill="rgba(79,110,247,0.12)" stroke="#4f6ef7" strokeWidth="1.5" />
        <text x="-45" y="4" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4f6ef7">CH₂</text>

        <line x1="-31" y1="0" x2="-19" y2="0" stroke="#64748b" strokeWidth="2" />

        {/* -OH 官能团高亮 */}
        <motion.g
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <circle cx="-5" cy="0" r="14" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="2" />
          <text x="-5" y="4" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ef4444">OH</text>
        </motion.g>

        {/* 分隔 */}
        <line x1="0" y1="-55" x2="0" y2="55" stroke="var(--border-light, #e2e8f0)" strokeWidth="1" strokeDasharray="4 3" opacity="0" />

        {/* 右：酚 */}
        <text x="70" y="-50" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--text, #1e293b)">
          酚 (苯酚)
        </text>

        {/* 苯环 */}
        <motion.polygon
          points="50,0 60,-18 80,-18 90,0 80,18 60,18"
          fill="rgba(79,110,247,0.08)"
          stroke="#4f6ef7"
          strokeWidth="1.5"
          animate={{ stroke: ['#4f6ef7', '#6366f1', '#4f6ef7'] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        {/* 苯环内圈 */}
        <circle cx="70" cy="0" r="9" fill="none" stroke="#4f6ef7" strokeWidth="1" strokeDasharray="2 2" />

        <line x1="90" y1="0" x2="102" y2="0" stroke="#64748b" strokeWidth="2" />

        {/* -OH 官能团高亮 */}
        <motion.g
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        >
          <circle cx="116" cy="0" r="14" fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth="2" />
          <text x="116" y="4" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#ef4444">OH</text>
        </motion.g>

        {/* 区别标注 */}
        <text x="-50" y="42" textAnchor="middle" fontSize="7" fill="var(--text-muted, #64748b)">
          与 Na 反应产生 H₂
        </text>
        <text x="70" y="42" textAnchor="middle" fontSize="7" fill="var(--text-muted, #64748b)">
          弱酸性，遇 FeCl₃ 变紫
        </text>
      </svg>
    </IllustrationCard>
  );
}
