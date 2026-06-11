import { motion } from 'framer-motion';
import { Info, Shield, BookOpen, AlertTriangle } from 'lucide-react';

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const childVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
};

export function AboutPage() {
  return (
    <motion.article
      className="container about-page"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.header className="about-header" variants={childVariant}>
        <div className="about-header-icon">
          <Info size={24} strokeWidth={1.6} />
        </div>
        <h1>关于本站</h1>
      </motion.header>

      <motion.p className="about-intro" variants={childVariant}>
        化学知识问答学习站面向高中生，提供化学知识点浏览与 AI 辅导问答。AI 解答仅供参考，请以教材与教师讲解为准。
      </motion.p>

      <motion.section className="card about-section" variants={childVariant}>
        <div className="about-section-head">
          <BookOpen size={18} strokeWidth={1.8} />
          <h2>使用说明</h2>
        </div>
        <ul>
          <li>注册登录后即可使用 AI 问答，大模型由平台统一接入配置。</li>
          <li>AI 问答可选择多种辅导风格，按场景切换。</li>
        </ul>
      </motion.section>

      <motion.section className="card about-section" variants={childVariant}>
        <div className="about-section-head">
          <Shield size={18} strokeWidth={1.8} />
          <h2>隐私与安全</h2>
        </div>
        <ul>
          <li>仅采集邮箱与昵称等必要信息。</li>
          <li>MVP 版本<strong>不支持忘记密码</strong>，请妥善保管账号密码。</li>
        </ul>
      </motion.section>

      <motion.section className="card about-section" variants={childVariant}>
        <div className="about-section-head">
          <AlertTriangle size={18} strokeWidth={1.8} />
          <h2>学术诚信</h2>
        </div>
        <p>请独立思考，遵守学校考试与作业纪律，勿将 AI 用于作弊。</p>
      </motion.section>

      <style>{`
        .about-page { max-width: 680px; padding-bottom: 2rem; }
        .about-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }
        .about-header-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius);
          background: var(--primary-light);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .about-header h1 { font-size: 1.4rem; font-weight: 700; }
        .about-intro {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }
        .about-section {
          padding: 1.25rem 1.5rem;
          margin-bottom: 1rem;
        }
        .about-section-head {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
          color: var(--text);
        }
        .about-section-head h2 { font-size: 1.05rem; font-weight: 600; }
        .about-section ul {
          padding-left: 1.25rem;
          color: var(--text-secondary);
          font-size: 0.92rem;
        }
        .about-section li { margin-bottom: 0.4rem; line-height: 1.6; }
        .about-section p {
          color: var(--text-secondary);
          font-size: 0.92rem;
          line-height: 1.6;
        }
      `}</style>
    </motion.article>
  );
}
