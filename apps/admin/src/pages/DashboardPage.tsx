import { useEffect, useState } from 'react';
import {
  Users,
  Crown,
  MessageSquare,
  FileCheck,
  UserPlus,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  getAdminStats,
  PLAN_LABELS,
  type AdminStats,
  type PlanType,
} from '../lib/admin';

const PLAN_COLORS: Record<PlanType, string> = {
  free: '#94a3b8',
  monthly: '#4f6ef7',
  quarterly: '#10b981',
  yearly: '#f59e0b',
};

export function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e?.message || '加载失败'));
  }, []);

  if (error) return <div className="vben-err">加载失败：{error}</div>;
  if (!stats) return <div className="vben-loading">加载中…</div>;

  const cards = [
    {
      label: '总用户数',
      value: stats.users.total,
      icon: Users,
      color: '#4f6ef7',
      sub: `今日新增 ${stats.users.newToday}`,
    },
    {
      label: '付费会员',
      value: stats.users.activePremium,
      icon: Crown,
      color: '#f59e0b',
      sub: `已验证 ${stats.users.verified} 人`,
    },
    {
      label: 'AI 对话消息',
      value: stats.chat.messages,
      icon: MessageSquare,
      color: '#10b981',
      sub: `今日 ${stats.chat.messagesToday} 条`,
    },
    {
      label: '考试作答',
      value: stats.exam.attempts,
      icon: FileCheck,
      color: '#8b5cf6',
      sub: `会话总数 ${stats.chat.sessions}`,
    },
  ];

  const maxTrend = Math.max(1, ...stats.signupTrend.map((d) => d.count));
  const totalPlans = Object.values(stats.planCounts).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="dash">
      <h1 className="dash-title">仪表盘</h1>
      <p className="dash-desc">数据实时来自数据库</p>

      <div className="dash-cards">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div className="dash-card" key={c.label}>
              <div className="dash-card-top">
                <span className="dash-card-label">{c.label}</span>
                <span
                  className="dash-card-icon"
                  style={{ background: `${c.color}1a`, color: c.color }}
                >
                  <Icon size={20} strokeWidth={1.8} />
                </span>
              </div>
              <div className="dash-card-value">{c.value.toLocaleString()}</div>
              <div className="dash-card-sub">{c.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="dash-grid">
        <section className="dash-panel">
          <div className="dash-panel-head">
            <TrendingUp size={16} />
            <h2>近 7 日新增用户</h2>
          </div>
          <div className="dash-chart">
            {stats.signupTrend.map((d) => (
              <div className="dash-bar-col" key={d.date}>
                <div className="dash-bar-wrap">
                  <span className="dash-bar-num">{d.count}</span>
                  <div
                    className="dash-bar"
                    style={{ height: `${(d.count / maxTrend) * 100}%` }}
                  />
                </div>
                <span className="dash-bar-label">{d.date}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dash-panel">
          <div className="dash-panel-head">
            <Crown size={16} />
            <h2>会员分布</h2>
          </div>
          <div className="dash-plans">
            {(Object.keys(PLAN_LABELS) as PlanType[]).map((plan) => {
              const count = stats.planCounts[plan] ?? 0;
              const pct = Math.round((count / totalPlans) * 100);
              return (
                <div className="dash-plan-row" key={plan}>
                  <div className="dash-plan-info">
                    <span
                      className="dash-plan-dot"
                      style={{ background: PLAN_COLORS[plan] }}
                    />
                    <span>{PLAN_LABELS[plan]}</span>
                  </div>
                  <div className="dash-plan-bar-track">
                    <div
                      className="dash-plan-bar-fill"
                      style={{ width: `${pct}%`, background: PLAN_COLORS[plan] }}
                    />
                  </div>
                  <span className="dash-plan-count">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="dash-extra">
            <div className="dash-extra-item">
              <ShieldCheck size={15} />
              管理员 {stats.users.admins} 人
            </div>
            <div className="dash-extra-item">
              <UserPlus size={15} />
              用户消息 {stats.chat.userMessages} 条
            </div>
          </div>
        </section>
      </div>

      <style>{dashStyles}</style>
    </div>
  );
}

const dashStyles = `
.vben-loading, .vben-err { padding: 3rem; text-align: center; color: #6b7280; }
.vben-err { color: #ef4444; }
.dash-title { font-size: 1.3rem; font-weight: 700; color: #1f2937; }
.dash-desc { color: #6b7280; font-size: 0.85rem; margin: 0.25rem 0 1.25rem; }

.dash-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.dash-card {
  background: #fff;
  border-radius: 10px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.dash-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.dash-card-label { color: #6b7280; font-size: 0.85rem; }
.dash-card-icon {
  width: 38px; height: 38px;
  border-radius: 9px;
  display: flex; align-items: center; justify-content: center;
}
.dash-card-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0.5rem 0 0.2rem;
}
.dash-card-sub { color: #9ca3af; font-size: 0.8rem; }

.dash-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 1rem;
}
.dash-panel {
  background: #fff;
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.dash-panel-head {
  display: flex; align-items: center; gap: 0.5rem;
  color: #4f6ef7;
  margin-bottom: 1.25rem;
}
.dash-panel-head h2 { font-size: 1rem; font-weight: 600; color: #1f2937; }

.dash-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem;
  height: 200px;
}
.dash-bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}
.dash-bar-wrap {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 0.25rem;
}
.dash-bar-num { font-size: 0.75rem; color: #6b7280; }
.dash-bar {
  width: 60%;
  max-width: 36px;
  min-height: 4px;
  background: linear-gradient(180deg, #6b8aff, #4f6ef7);
  border-radius: 4px 4px 0 0;
  transition: height 0.4s;
}
.dash-bar-label { font-size: 0.75rem; color: #9ca3af; margin-top: 0.4rem; }

.dash-plans { display: flex; flex-direction: column; gap: 0.85rem; }
.dash-plan-row {
  display: grid;
  grid-template-columns: 90px 1fr 32px;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.85rem;
}
.dash-plan-info { display: flex; align-items: center; gap: 0.4rem; color: #4b5563; }
.dash-plan-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.dash-plan-bar-track {
  height: 8px;
  background: #f1f5f9;
  border-radius: 4px;
  overflow: hidden;
}
.dash-plan-bar-fill { height: 100%; border-radius: 4px; transition: width 0.4s; }
.dash-plan-count { text-align: right; color: #1f2937; font-weight: 600; }
.dash-extra {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 1.25rem;
}
.dash-extra-item {
  display: flex; align-items: center; gap: 0.4rem;
  font-size: 0.82rem; color: #6b7280;
}

@media (max-width: 900px) {
  .dash-cards { grid-template-columns: repeat(2, 1fr); }
  .dash-grid { grid-template-columns: 1fr; }
}
`;

