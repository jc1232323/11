import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 原子结构 — 电子绕核运动 */
export function AtomStructureAnimation() {
  const orbits = [25, 42, 60];
  const electrons = [
    { orbit: 0, angle: 0, speed: 3 },
    { orbit: 0, angle: 180, speed: 3 },
    { orbit: 1, angle: 60, speed: 4.5 },
    { orbit: 1, angle: 180, speed: 4.5 },
    { orbit: 1, angle: 300, speed: 4.5 },
    { orbit: 2, angle: 0, speed: 6 },
    { orbit: 2, angle: 120, speed: 6 },
    { orbit: 2, angle: 240, speed: 6 },
  ];

  return (
    <IllustrationCard title="原子结构：原子核 + 核外电子分层排布">
      <svg viewBox="-90 -90 180 180" width="180" height="180">
        {/* 电子轨道 */}
        {orbits.map((r, i) => (
          <circle
            key={i}
            cx="0" cy="0" r={r}
            fill="none"
            stroke="var(--border-light, #e2e8f0)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        ))}

        {/* 原子核 */}
        <motion.circle
          cx="0" cy="0" r="12"
          fill="var(--primary, #4f6ef7)"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <text x="0" y="1" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold" dy="2">
          原子核
        </text>

        {/* 电子 */}
        {electrons.map((e, i) => {
          const r = orbits[e.orbit];
          return (
            <motion.circle
              key={i}
              r="4"
              fill="#f59e0b"
              stroke="#d97706"
              strokeWidth="1"
              initial={{
                cx: r * Math.cos((e.angle * Math.PI) / 180),
                cy: r * Math.sin((e.angle * Math.PI) / 180),
              }}
              animate={{
                cx: Array.from({ length: 37 }, (_, k) =>
                  r * Math.cos(((e.angle + k * 10) * Math.PI) / 180)
                ),
                cy: Array.from({ length: 37 }, (_, k) =>
                  r * Math.sin(((e.angle + k * 10) * Math.PI) / 180)
                ),
              }}
              transition={{
                duration: e.speed,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          );
        })}

        {/* 层标注 */}
        <text x="0" y={-orbits[0] - 6} textAnchor="middle" fontSize="7" fill="var(--text-muted, #64748b)">K</text>
        <text x="0" y={-orbits[1] - 6} textAnchor="middle" fontSize="7" fill="var(--text-muted, #64748b)">L</text>
        <text x="0" y={-orbits[2] - 6} textAnchor="middle" fontSize="7" fill="var(--text-muted, #64748b)">M</text>
      </svg>
    </IllustrationCard>
  );
}
