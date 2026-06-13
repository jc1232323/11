import { FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api, ApiError } from '../lib/api';
import {
  CalendarDays,
  BookOpen,
  Target,
  GraduationCap,
  Loader2,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';

type DayPlan = {
  day: number;
  date: string;
  topics: string[];
  practice: string;
  duration: string;
  focus: string;
};

type StudyPlanData = {
  id: string;
  targetScore: number;
  grade: string;
  targetSchool: string;
  weakPoints: string | null;
  planContent: string;
  createdAt: string;
};

export function StudyPlanPage() {
  const [plan, setPlan] = useState<StudyPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [targetScore, setTargetScore] = useState(80);
  const [grade, setGrade] = useState('高三');
  const [targetSchool, setTargetSchool] = useState('');
  const [weakPoints, setWeakPoints] = useState('');

  useEffect(() => {
    api<StudyPlanData | null>('/study-plan')
      .then((data) => {
        if (data) {
          setPlan(data);
          setTargetScore(data.targetScore);
          setGrade(data.grade);
          setTargetSchool(data.targetSchool);
          setWeakPoints(data.weakPoints || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function onGenerate(e: FormEvent) {
    e.preventDefault();
    if (!targetSchool.trim()) {
      setError('请填写目标学校');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const result = await api<StudyPlanData>('/study-plan/generate', {
        method: 'POST',
        body: JSON.stringify({
          targetScore,
          grade,
          targetSchool: targetSchool.trim(),
          weakPoints: weakPoints.trim() || undefined,
        }),
      });
      setPlan(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '生成失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  }

  let days: DayPlan[] = [];
  if (plan) {
    try {
      days = JSON.parse(plan.planContent);
    } catch { /* ignore */ }
  }

  if (loading) {
    return (
      <div className="container sp-page sp-loading">
        <Loader2 size={24} className="sp-spinner" />
        <span>加载中...</span>
      </div>
    );
  }

  return (
    <div className="container sp-page">
      <motion.header
        className="sp-header"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="sp-header-icon">
          <CalendarDays size={24} strokeWidth={1.6} />
        </div>
        <div>
          <h1>个性化学习计划</h1>
          <p className="sp-header-desc">AI 根据你的目标量身定制 30 天化学学习计划</p>
        </div>
      </motion.header>

      {/* Form Section */}
      <motion.form
        className="card sp-form"
        onSubmit={onGenerate}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
      >
        <h2 className="sp-form-title">
          {plan ? '更新学习信息' : '填写你的学习目标'}
        </h2>
        <div className="sp-form-grid">
          <div className="sp-field">
            <label className="sp-label">
              <Target size={14} strokeWidth={2} />
              目标分数（满分100）
            </label>
            <input
              className="sp-input"
              type="number"
              min={30}
              max={100}
              value={targetScore}
              onChange={(e) => setTargetScore(Number(e.target.value))}
              required
            />
          </div>
          <div className="sp-field">
            <label className="sp-label">
              <GraduationCap size={14} strokeWidth={2} />
              年级
            </label>
            <select
              className="sp-input"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="高一">高一</option>
              <option value="高二">高二</option>
              <option value="高三">高三</option>
            </select>
          </div>
          <div className="sp-field">
            <label className="sp-label">
              <BookOpen size={14} strokeWidth={2} />
              目标学校
            </label>
            <input
              className="sp-input"
              type="text"
              placeholder="如：清华大学、浙江大学"
              value={targetSchool}
              onChange={(e) => setTargetSchool(e.target.value)}
              required
            />
          </div>
          <div className="sp-field sp-field-full">
            <label className="sp-label">
              <Sparkles size={14} strokeWidth={2} />
              薄弱环节（可选）
            </label>
            <textarea
              className="sp-input sp-textarea"
              placeholder="如：电化学、有机推断、实验题表达不好..."
              value={weakPoints}
              onChange={(e) => setWeakPoints(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {error && <p className="sp-error">{error}</p>}

        <button className="btn btn-primary sp-submit" disabled={generating}>
          {generating ? (
            <>
              <Loader2 size={16} className="sp-spinner" />
              AI 正在生成计划...
            </>
          ) : plan ? (
            <>
              <RefreshCw size={16} strokeWidth={2} />
              重新生成计划
            </>
          ) : (
            <>
              <Sparkles size={16} strokeWidth={2} />
              生成学习计划
            </>
          )}
        </button>
      </motion.form>

      {/* Plan Display */}
      {days.length > 0 && (
        <motion.section
          className="sp-plan"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="sp-plan-header">
            <h2>你的 30 天学习计划</h2>
            <p className="sp-plan-meta">
              目标：{plan!.targetSchool} · {plan!.grade} · {plan!.targetScore}分
            </p>
          </div>

          <div className="sp-days">
            {days.map((day) => (
              <div key={day.day} className="sp-day-card">
                <div className="sp-day-head">
                  <span className="sp-day-num">Day {day.day}</span>
                  <span className="sp-day-date">{day.date}</span>
                  {day.duration && (
                    <span className="sp-day-duration">
                      <Clock size={12} strokeWidth={2} />
                      {day.duration}
                    </span>
                  )}
                </div>
                <p className="sp-day-focus">{day.focus}</p>
                <div className="sp-day-topics">
                  {day.topics.map((t) => (
                    <span key={t} className="sp-day-topic">{t}</span>
                  ))}
                </div>
                <p className="sp-day-practice">{day.practice}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      <style>{`
        .sp-page { padding-bottom: 2rem; }
        .sp-page.sp-loading {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; color: var(--text-muted); padding: 4rem 0;
        }
        .sp-spinner { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .sp-header {
          display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;
        }
        .sp-header-icon {
          width: 48px; height: 48px; border-radius: var(--radius);
          background: var(--primary-light); color: var(--primary);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .sp-header h1 { font-size: 1.4rem; font-weight: 700; color: var(--text); margin-bottom: 0.15rem; }
        .sp-header-desc { color: var(--text-muted); font-size: 0.9rem; }
        .sp-form { padding: 1.5rem; margin-bottom: 1.5rem; }
        .sp-form-title { font-size: 1.05rem; font-weight: 600; color: var(--text); margin-bottom: 1.25rem; }
        .sp-form-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem; margin-bottom: 1.25rem;
        }
        .sp-field-full { grid-column: 1 / -1; }
        .sp-label {
          display: flex; align-items: center; gap: 0.35rem;
          font-size: 0.84rem; font-weight: 500; color: var(--text-secondary);
          margin-bottom: 0.4rem;
        }
        .sp-input {
          width: 100%; padding: 0.6rem 0.8rem;
          border: 1.5px solid var(--border); border-radius: var(--radius);
          background: var(--bg); font-size: 0.9rem; color: var(--text);
          transition: border-color var(--duration) var(--ease);
        }
        .sp-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .sp-textarea { resize: vertical; min-height: 60px; }
        .sp-error {
          color: var(--danger); font-size: 0.85rem; margin-bottom: 1rem;
          padding: 0.5rem 0.75rem; background: rgba(239,68,68,0.06); border-radius: var(--radius-sm);
        }
        .sp-submit { padding: 0.7rem 1.2rem; font-size: 0.9rem; }
        .sp-plan { margin-top: 0.5rem; }
        .sp-plan-header { margin-bottom: 1.25rem; }
        .sp-plan-header h2 { font-size: 1.2rem; font-weight: 700; color: var(--text); margin-bottom: 0.25rem; }
        .sp-plan-meta { font-size: 0.85rem; color: var(--text-muted); }
        .sp-days { display: flex; flex-direction: column; gap: 0.75rem; }
        .sp-day-card {
          padding: 1rem 1.25rem; border-radius: var(--radius);
          border: 1px solid var(--border); background: var(--bg-elevated);
          transition: border-color var(--duration) var(--ease), box-shadow var(--duration) var(--ease);
        }
        .sp-day-card:hover { border-color: rgba(79,110,247,0.2); box-shadow: 0 4px 12px rgba(79,110,247,0.05); }
        .sp-day-head {
          display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; flex-wrap: wrap;
        }
        .sp-day-num {
          font-size: 0.8rem; font-weight: 700; color: var(--primary);
          background: var(--primary-light); padding: 0.2rem 0.55rem; border-radius: 999px;
        }
        .sp-day-date { font-size: 0.8rem; color: var(--text-muted); }
        .sp-day-duration {
          display: inline-flex; align-items: center; gap: 0.25rem;
          font-size: 0.75rem; color: var(--text-muted); margin-left: auto;
        }
        .sp-day-focus {
          font-size: 0.92rem; color: var(--text); font-weight: 500; margin-bottom: 0.5rem;
        }
        .sp-day-topics { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.5rem; }
        .sp-day-topic {
          padding: 0.18rem 0.55rem; border-radius: 999px;
          font-size: 0.75rem; font-weight: 500;
          background: rgba(16,185,129,0.1); color: #059669;
        }
        .sp-day-practice {
          font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5;
        }
        @media (max-width: 768px) {
          .sp-form-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
