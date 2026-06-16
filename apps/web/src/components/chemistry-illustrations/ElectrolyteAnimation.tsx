import { motion } from 'framer-motion';
import { IllustrationCard } from './IllustrationCard';

/** 电解质与电离 — NaCl 溶于水后离子分离 */
export function ElectrolyteAnimation() {
  const ions = [
    { id: 'na1', label: 'Na⁺', color: '#f59e0b', tx: -50, ty: -30 },
    { id: 'cl1', label: 'Cl⁻', color: '#10b981', tx: 50, ty: -30 },
    { id: 'na2', label: 'Na⁺', color: '#f59e0b', tx: -45, ty: 35 },
    { id: 'cl2', label: 'Cl⁻', color: '#10b981', tx: 55, ty: 40 },
    { id: 'na3', label: 'Na⁺', color: '#f59e0b', tx: -60, ty: 5 },
    { id: 'cl3', label: 'Cl⁻', color: '#10b981', tx: 60, ty: -5 },
  ];

  return (
    <IllustrationCard title="NaCl 溶于水电离：NaCl → Na⁺ + Cl⁻">
      <svg viewBox="-120 -80 240 160" width="100%" height="170">
        {/* 水的背景 */}
        <rect x="-110" y="-70" width="220" height="140" rx="12" fill="rgba(59,130,246,0.06)" />

        {/* 水分子符号 */}
        <text x="75" y="-55" fontSize="9" fill="#93c5fd" opacity="0.7">H₂O</text>
        <text x="-90" y="55" fontSize="9" fill="#93c5fd" opacity="0.7">H₂O</text>

        {/* 离子从中心扩散 */}
        {ions.map((ion, i) => (
          <motion.g
            key={ion.id}
            initial={{ x: 0, y: 0, opacity: 0 }}
            animate={{
              x: [0, ion.tx],
              y: [0, ion.ty],
              opacity: [0, 1],
            }}
            transition={{
              duration: 2,
              delay: 0.5 + i * 0.2,
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 1.5,
            }}
          >
            <circle r="16" fill={ion.color} opacity="0.2" />
            <circle r="12" fill={ion.color} opacity="0.85" />
            <text
              textAnchor="middle"
              dy="4"
              fontSize="9"
              fontWeight="bold"
              fill="white"
            >
              {ion.label}
            </text>
          </motion.g>
        ))}

        {/* 中心 NaCl 晶体标识 */}
        <motion.g
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 0.3] }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: 'reverse', repeatDelay: 1.5 }}
        >
          <rect x="-18" y="-14" width="36" height="28" rx="4" fill="#94a3b8" opacity="0.3" />
          <text textAnchor="middle" dy="5" fontSize="11" fontWeight="bold" fill="var(--text-muted, #64748b)">
            NaCl
          </text>
        </motion.g>
      </svg>
    </IllustrationCard>
  );
}
