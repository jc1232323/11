import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 焓变与热化学方程式 — 能量图 */
export function EnthalpyAnimation() {
  return (
    <IllustrationCard title="焓变 ΔH：放热反应 ΔH＜0，吸热反应 ΔH＞0">
      <svg viewBox="-130 -75 260 155" width="100%" height="165">
        {/* 左侧：放热反应 */}
        <text x="-65" y="-60" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--text, #1e293b)">
          放热反应
        </text>

        {/* Y 轴 */}
        <line x1="-105" y1="-45" x2="-105" y2="55" stroke="var(--text-muted, #64748b)" strokeWidth="1" />
        <text x="-108" y="-40" textAnchor="end" fontSize="7" fill="var(--text-muted, #64748b)">能量</text>

        {/* 反应物能级 */}
        <line x1="-95" y1="-25" x2="-60" y2="-25" stroke="#ef4444" strokeWidth="2" />
        <text x="-77" y="-30" textAnchor="middle" fontSize="7" fill="#ef4444">反应物</text>

        {/* 生成物能级 */}
        <line x1="-60" y1="30" x2="-25" y2="30" stroke="#3b82f6" strokeWidth="2" />
        <text x="-42" y="43" textAnchor="middle" fontSize="7" fill="#3b82f6">生成物</text>

        {/* ΔH 箭头 */}
        <motion.g
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <line x1="-30" y1="-25" x2="-30" y2="30" stroke="#f59e0b" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <text x="-22" y="5" fontSize="9" fontWeight="bold" fill="#f59e0b">ΔH＜0</text>
        </motion.g>

        {/* 能量释放火焰 */}
        <motion.text
          x="-42" y="60" fontSize="14"
          animate={{ y: [60, 55, 60], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          🔥
        </motion.text>

        {/* 分隔 */}
        <line x1="0" y1="-65" x2="0" y2="65" stroke="var(--border-light, #e2e8f0)" strokeWidth="1" strokeDasharray="4 3" />

        {/* 右侧：吸热反应 */}
        <text x="65" y="-60" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--text, #1e293b)">
          吸热反应
        </text>

        {/* Y 轴 */}
        <line x1="25" y1="-45" x2="25" y2="55" stroke="var(--text-muted, #64748b)" strokeWidth="1" />

        {/* 反应物能级 */}
        <line x1="35" y1="25" x2="70" y2="25" stroke="#3b82f6" strokeWidth="2" />
        <text x="52" y="38" textAnchor="middle" fontSize="7" fill="#3b82f6">反应物</text>

        {/* 生成物能级 */}
        <line x1="70" y1="-25" x2="105" y2="-25" stroke="#ef4444" strokeWidth="2" />
        <text x="87" y="-30" textAnchor="middle" fontSize="7" fill="#ef4444">生成物</text>

        {/* ΔH 箭头 */}
        <motion.g
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <line x1="100" y1="25" x2="100" y2="-25" stroke="#8b5cf6" strokeWidth="1.5" markerEnd="url(#arrow2)" />
          <text x="110" y="5" fontSize="9" fontWeight="bold" fill="#8b5cf6">ΔH＞0</text>
        </motion.g>

        {/* 吸热 ❄️ */}
        <motion.text
          x="70" y="60" fontSize="14"
          animate={{ y: [60, 55, 60], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
        >
          ❄️
        </motion.text>

        {/* 箭头标记 */}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="#f59e0b" />
          </marker>
          <marker id="arrow2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M 0 0 L 6 3 L 0 6 Z" fill="#8b5cf6" />
          </marker>
        </defs>
      </svg>
    </IllustrationCard>
  );
}
