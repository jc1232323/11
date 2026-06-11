import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  MessageSquare,
  Target,
  FlaskConical,
  ArrowRight,
  Layers,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

const STATIC_FEATURES = [
  { icon: Layers, title: '三级知识目录', desc: '模块、章节、知识点，覆盖高中化学核心内容。' },
  { icon: MessageSquare, title: 'AI 智能辅导', desc: '流式回复，可按知识点讲解或出题练习。' },
  { icon: Target, title: '十种 AI 角色', desc: '温柔老师、高考冲刺、实验达人等，按场景切换辅导风格。' },
  { icon: FlaskConical, title: '公式渲染', desc: 'Markdown + LaTeX，化学公式清晰可读。' },
];

const GUEST_MODULES = [
  { title: '化学基础', desc: '物质的量、离子反应', icon: FlaskConical },
  { title: '物质的结构', desc: '原子结构、化学键', icon: Layers },
  { title: '化学反应与能量', desc: '反应热、反应速率', icon: Sparkles },
  { title: '有机化学基础', desc: '烃、官能团', icon: BookOpen },
];

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const childVariant = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

export function GuestHomePage() {
  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero-section">
        <div className="container hero-inner">
          <motion.div
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.p className="hero-badge" variants={childVariant}>
              <GraduationCap size={14} strokeWidth={2} />
              全国高中生化学学习平台
            </motion.p>
            <motion.h1 className="hero-title" variants={childVariant}>
              系统化知识点
              <br />
              <span className="hero-highlight">+ AI 辅导问答</span>
            </motion.h1>
            <motion.p className="hero-lead" variants={childVariant}>
              登录即可开始 AI 对话，按模块浏览高中化学核心知识，
              支持按知识点讲解、出题练习，双角色随心切换。
            </motion.p>
            <motion.div className="hero-actions" variants={childVariant}>
              <Link to="/register" className="btn btn-primary btn-lg">
                免费注册
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
              <Link to="/login" className="btn btn-ghost btn-lg">
                已有账号登录
              </Link>
            </motion.div>
            <motion.div className="hero-stats" variants={childVariant}>
              <span>4+ 模块</span>
              <span className="stats-dot" />
              <span>20+ 知识点</span>
              <span className="stats-dot" />
              <span>流式 AI 回复</span>
              <span className="stats-dot" />
              <span>公式渲染</span>
            </motion.div>
          </motion.div>
          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="mock-chat-card">
              <div className="mock-header">
                <Sparkles size={14} />
                <span>AI 对话</span>
              </div>
              <div className="mock-messages">
                <div className="mock-bubble user">学习讲解：摩尔与阿伏伽德罗常数</div>
                <div className="mock-bubble ai">
                  物质的量 n 表示粒子集合的物理量，1 mol 含有 6.022 x 10²³ 个粒子...
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modules */}
      <section className="container section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          <motion.h2 className="section-title" variants={childVariant}>知识模块</motion.h2>
          <motion.div className="module-grid" variants={staggerContainer}>
            {GUEST_MODULES.map((mod) => {
              const Icon = mod.icon;
              return (
                <motion.div key={mod.title} className="card card-hover module-card" variants={childVariant}>
                  <div className="module-icon-wrap">
                    <Icon size={20} strokeWidth={1.6} />
                  </div>
                  <h3>{mod.title}</h3>
                  <p>{mod.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="container section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={staggerContainer}
        >
          <motion.h2 className="section-title" variants={childVariant}>平台特色</motion.h2>
          <motion.div className="feature-grid" variants={staggerContainer}>
            {STATIC_FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div key={f.title} className="card card-hover feature-card" variants={childVariant}>
                  <div className="feature-icon">
                    <Icon size={22} strokeWidth={1.6} />
                  </div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      <style>{`
        .home-page { padding-bottom: 3rem; }

        /* Hero */
        .hero-section {
          padding: 3rem 0 2rem;
          background: linear-gradient(160deg, var(--primary-muted) 0%, var(--bg) 50%, rgba(99, 102, 241, 0.03) 100%);
          position: relative;
          overflow: hidden;
        }
        .hero-section::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(79, 110, 247, 0.06) 0%, transparent 70%);
          border-radius: 50%;
        }
        .hero-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }
        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr; gap: 2rem; }
          .hero-visual { display: none; }
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.9rem;
          background: var(--primary-light);
          color: var(--primary);
          font-size: 0.82rem;
          font-weight: 600;
          border-radius: 999px;
          margin-bottom: 1.25rem;
        }
        .hero-title {
          font-size: clamp(2rem, 4.5vw, 2.75rem);
          line-height: 1.2;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .hero-highlight {
          background: linear-gradient(135deg, var(--primary), #6366f1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-lead {
          color: var(--text-secondary);
          max-width: 28rem;
          margin-bottom: 1.75rem;
          font-size: 1rem;
          line-height: 1.7;
        }
        .hero-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .btn-lg { padding: 0.75rem 1.5rem; font-size: 0.95rem; }
        .hero-stats {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .stats-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--border);
        }

        /* Mock chat visual */
        .hero-visual { position: relative; z-index: 1; }
        .mock-chat-card {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
        }
        .mock-header {
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--primary);
        }
        .mock-messages { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .mock-bubble {
          padding: 0.7rem 1rem;
          border-radius: var(--radius);
          font-size: 0.85rem;
          line-height: 1.5;
          max-width: 85%;
        }
        .mock-bubble.user {
          align-self: flex-end;
          background: var(--primary);
          color: #fff;
        }
        .mock-bubble.ai {
          align-self: flex-start;
          background: var(--bg);
          border: 1px solid var(--border-light);
          color: var(--text-secondary);
        }

        /* Sections */
        .section { margin-top: 3.5rem; }
        .section-title {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text);
        }
        .module-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }
        .module-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .module-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: var(--radius);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.25rem;
        }
        .module-card h3 { font-size: 1rem; font-weight: 600; color: var(--text); }
        .module-card p { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
        }
        .feature-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .feature-icon {
          width: 42px;
          height: 42px;
          border-radius: var(--radius);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.25rem;
        }
        .feature-card h3 { font-size: 1rem; font-weight: 600; color: var(--text); }
        .feature-card p { color: var(--text-muted); font-size: 0.9rem; margin: 0; line-height: 1.6; }
      `}</style>
    </div>
  );
}
