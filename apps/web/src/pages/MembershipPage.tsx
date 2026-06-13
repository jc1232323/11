import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Sparkles, Zap } from 'lucide-react';

const plans = [
  {
    id: 'monthly',
    name: '月卡',
    price: '19.9',
    period: '/月',
    desc: '一杯奶茶的价格',
    badge: null,
    features: [
      'AI 对话无限次',
      '全部 AI 角色解锁',
      '全部专题训练题包',
      '个性化学习计划',
    ],
  },
  {
    id: 'quarterly',
    name: '季卡',
    price: '49.9',
    period: '/季',
    desc: '平均 ¥16.6/月，省 30%',
    badge: '主推',
    features: [
      '月卡全部权益',
      '模拟考试不限次',
      '错题本 + 收藏夹',
      '对话记录永久保存',
      '优先 AI 响应速度',
    ],
  },
  {
    id: 'yearly',
    name: '年卡',
    price: '149.9',
    period: '/年',
    desc: '平均 ¥12.5/月，最划算',
    badge: '最划算',
    features: [
      '季卡全部权益',
      '高考真题解析库',
      'AI 深度辅导模式',
      '导出对话为 PDF',
      '专属学习报告',
      '适合高三全年备考',
    ],
  },
];

export function MembershipPage() {
  const [selected, setSelected] = useState('quarterly');

  return (
    <div className="container membership-page">
      <motion.header
        className="mem-header"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="mem-header-icon">
          <Crown size={28} strokeWidth={1.6} />
        </div>
        <div>
          <h1>升级会员</h1>
          <p className="mem-header-desc">解锁全部功能，让 AI 全力助你备考</p>
        </div>
      </motion.header>

      <motion.div
        className="mem-plans"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      >
        {plans.map((plan) => {
          const isActive = selected === plan.id;
          return (
            <div
              key={plan.id}
              className={`mem-plan-card ${isActive ? 'active' : ''}`}
              onClick={() => setSelected(plan.id)}
            >
              {plan.badge && <span className="mem-badge">{plan.badge}</span>}
              <h3 className="mem-plan-name">{plan.name}</h3>
              <div className="mem-plan-price">
                <span className="mem-price-symbol">¥</span>
                <span className="mem-price-value">{plan.price}</span>
                <span className="mem-price-period">{plan.period}</span>
              </div>
              <p className="mem-plan-desc">{plan.desc}</p>
              <ul className="mem-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <Check size={14} strokeWidth={2.5} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </motion.div>

      <motion.div
        className="mem-action"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
      >
        <button className="btn btn-primary mem-pay-btn">
          <Zap size={18} strokeWidth={2} />
          立即开通 {plans.find((p) => p.id === selected)?.name}
        </button>
        <p className="mem-pay-hint">
          <Sparkles size={14} strokeWidth={1.8} />
          支持微信支付 / 支付宝，开通后即时生效
        </p>
      </motion.div>

      <motion.section
        className="mem-faq card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <h2>常见问题</h2>
        <div className="mem-faq-item">
          <h4>开通后可以退款吗？</h4>
          <p>开通后 7 天内未使用付费功能可申请全额退款。</p>
        </div>
        <div className="mem-faq-item">
          <h4>到期后会怎样？</h4>
          <p>到期后自动降级为免费版，已保存的数据不会丢失。</p>
        </div>
        <div className="mem-faq-item">
          <h4>可以升级套餐吗？</h4>
          <p>可以随时升级，按剩余天数折算差价。</p>
        </div>
      </motion.section>

      <style>{`
        .membership-page { padding-bottom: 3rem; max-width: 900px; }
        .mem-header {
          display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;
        }
        .mem-header-icon {
          width: 56px; height: 56px; border-radius: var(--radius);
          background: linear-gradient(135deg, #fef3c7, #fde68a);
          color: #b45309;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .mem-header h1 { font-size: 1.5rem; font-weight: 700; color: var(--text); margin-bottom: 0.15rem; }
        .mem-header-desc { color: var(--text-muted); font-size: 0.92rem; }

        .mem-plans {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .mem-plan-card {
          position: relative;
          padding: 1.5rem;
          border-radius: var(--radius-lg);
          border: 2px solid var(--border);
          background: var(--bg-elevated);
          cursor: pointer;
          transition: all var(--duration) var(--ease);
        }
        .mem-plan-card:hover {
          border-color: rgba(79, 110, 247, 0.3);
          box-shadow: 0 8px 24px rgba(79, 110, 247, 0.08);
        }
        .mem-plan-card.active {
          border-color: var(--primary);
          box-shadow: 0 8px 32px rgba(79, 110, 247, 0.12);
          background: linear-gradient(180deg, rgba(79, 110, 247, 0.03) 0%, var(--bg-elevated) 100%);
        }
        .mem-badge {
          position: absolute;
          top: -1px; right: 1rem;
          padding: 0.25rem 0.65rem;
          border-radius: 0 0 8px 8px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
        }
        .mem-plan-name {
          font-size: 1rem; font-weight: 600; color: var(--text); margin-bottom: 0.75rem;
        }
        .mem-plan-price {
          display: flex; align-items: baseline; gap: 0.1rem; margin-bottom: 0.35rem;
        }
        .mem-price-symbol { font-size: 1rem; font-weight: 500; color: var(--text-secondary); }
        .mem-price-value { font-size: 2rem; font-weight: 800; color: var(--text); line-height: 1; }
        .mem-price-period { font-size: 0.85rem; color: var(--text-muted); margin-left: 0.2rem; }
        .mem-plan-desc {
          font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;
        }
        .mem-features { list-style: none; display: flex; flex-direction: column; gap: 0.45rem; }
        .mem-features li {
          display: flex; align-items: center; gap: 0.4rem;
          font-size: 0.84rem; color: var(--text-secondary);
        }
        .mem-features li svg { color: #10b981; flex-shrink: 0; }

        .mem-action { text-align: center; margin-bottom: 2.5rem; }
        .mem-pay-btn {
          padding: 0.85rem 2rem; font-size: 1rem; font-weight: 600;
          border-radius: var(--radius-lg);
          box-shadow: 0 4px 16px rgba(79, 110, 247, 0.25);
        }
        .mem-pay-btn:hover { box-shadow: 0 8px 24px rgba(79, 110, 247, 0.35); transform: translateY(-1px); }
        .mem-pay-hint {
          display: flex; align-items: center; justify-content: center; gap: 0.35rem;
          margin-top: 0.85rem; font-size: 0.82rem; color: var(--text-muted);
        }

        .mem-faq { padding: 1.5rem; }
        .mem-faq h2 { font-size: 1.1rem; font-weight: 600; color: var(--text); margin-bottom: 1rem; }
        .mem-faq-item { margin-bottom: 1rem; }
        .mem-faq-item:last-child { margin-bottom: 0; }
        .mem-faq-item h4 { font-size: 0.9rem; font-weight: 600; color: var(--text); margin-bottom: 0.25rem; }
        .mem-faq-item p { font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; }

        @media (max-width: 768px) {
          .mem-plans { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
