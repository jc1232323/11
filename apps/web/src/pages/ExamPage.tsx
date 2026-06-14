import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import { ChemText } from '../components/ChemText';
import {
  getFallbackExamDetail,
  startFallbackExamAttempt,
  submitFallbackExamAttempt,
} from '../lib/exam-fallback';

type QuestionDetail = {
  id: string;
  title: string;
  type: string;
  prompt: string;
  options: Array<{ key: string; text: string }> | null;
  score: number;
  knowledgePoints: string[];
};

type ExamData = {
  examId: string;
  title: string;
  duration: number;
  totalScore: number;
  questionDetails: QuestionDetail[];
};

type AttemptData = {
  id: string;
  startedAt: string;
};

export function ExamPage() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [attempt, setAttempt] = useState<AttemptData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSubmit = useCallback(async (finalAnswers: Record<string, string>, attemptId: string) => {
    if (submitting) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);
    try {
      const result = await api<{ id: string }>('/exam/submit', {
        method: 'POST',
        body: JSON.stringify({ attemptId, answers: finalAnswers }),
      });
      navigate(`/exam/report/${result.id}`, { replace: true });
    } catch {
      const result = submitFallbackExamAttempt(attemptId, finalAnswers);
      if (result) {
        navigate(`/exam/report/${result.id}`, { replace: true });
        return;
      }

      setSubmitting(false);
    }
  }, [submitting, navigate]);

  useEffect(() => {
    if (!examId) return;
    const init = async () => {
      try {
        const [examData, attemptData] = await Promise.all([
          api<ExamData>(`/exam/papers/${examId}`),
          api<AttemptData>('/exam/start', {
            method: 'POST',
            body: JSON.stringify({ examId }),
          }),
        ]);
        setExam(examData);
        setAttempt(attemptData);

        // Calculate remaining time
        const elapsed = (Date.now() - new Date(attemptData.startedAt).getTime()) / 1000;
        const remaining = Math.max(0, examData.duration * 60 - elapsed);
        setTimeLeft(Math.floor(remaining));
      } catch {
        const fallbackExam = getFallbackExamDetail(examId);
        const fallbackAttempt = startFallbackExamAttempt(examId);

        if (!fallbackExam || !fallbackAttempt) {
          navigate('/exam', { replace: true });
          return;
        }

        setExam(fallbackExam);
        setAttempt({
          id: fallbackAttempt.id,
          startedAt: fallbackAttempt.startedAt,
        });

        const elapsed = (Date.now() - new Date(fallbackAttempt.startedAt).getTime()) / 1000;
        const remaining = Math.max(0, fallbackExam.duration * 60 - elapsed);
        setTimeLeft(Math.floor(remaining));
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [examId, navigate]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || !attempt) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up, auto-submit
          if (timerRef.current) clearInterval(timerRef.current);
          handleSubmit(answers, attempt.id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [attempt, timeLeft > 0]); // eslint-disable-line

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const setAnswer = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  if (loading || !exam || !attempt) {
    return (
      <div className="container exam-page" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  const questions = exam.questionDetails;
  const current = questions[currentIndex];
  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
  const isUrgent = timeLeft < 300; // less than 5 minutes

  return (
    <div className="exam-page">
      {/* Timer bar */}
      <div className={`exam-timer-bar ${isUrgent ? 'urgent' : ''}`}>
        <div className="exam-timer-left">
          <Clock size={16} strokeWidth={2} />
          <span className="exam-timer-text">{formatTime(timeLeft)}</span>
          {isUrgent && <AlertTriangle size={14} />}
        </div>
        <div className="exam-timer-center">
          <span>{exam.title}</span>
        </div>
        <div className="exam-timer-right">
          <span>{answeredCount}/{questions.length} 已答</span>
          <button
            type="button"
            className="btn btn-primary exam-submit-btn"
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
          >
            <Send size={14} strokeWidth={2} />
            交卷
          </button>
        </div>
      </div>

      <div className="exam-body">
        {/* Question navigation sidebar */}
        <aside className="exam-nav">
          <h4>题号导航</h4>
          <div className="exam-nav-grid">
            {questions.map((q, i) => (
              <button
                key={q.id}
                type="button"
                className={`exam-nav-btn ${i === currentIndex ? 'current' : ''} ${answers[q.id]?.trim() ? 'answered' : ''}`}
                onClick={() => setCurrentIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </aside>
        {/* Question content */}
        <main className="exam-content">
          <motion.div
            key={current.id}
            className="exam-question-card"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="exam-question-header">
              <span className="exam-question-index">第 {currentIndex + 1} 题</span>
              <span className="exam-question-type">{current.type}</span>
              <span className="exam-question-score">（{current.score} 分）</span>
            </div>
            <p className="exam-question-prompt"><ChemText text={current.prompt} /></p>

            {current.type === '单选题' && current.options ? (
              <div className="exam-options">
                {current.options.map((opt) => (
                  <label
                    key={opt.key}
                    className={`exam-option ${answers[current.id] === opt.key ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`q-${current.id}`}
                      value={opt.key}
                      checked={answers[current.id] === opt.key}
                      onChange={() => setAnswer(current.id, opt.key)}
                    />
                    <span className="exam-option-key">{opt.key}</span>
                    <span className="exam-option-text"><ChemText text={opt.text} /></span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                className="exam-textarea"
                placeholder="请输入你的答案..."
                value={answers[current.id] ?? ''}
                onChange={(e) => setAnswer(current.id, e.target.value)}
                rows={6}
              />
            )}
          </motion.div>

          <div className="exam-question-nav">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
            >
              上一题
            </button>
            <span className="exam-question-pos">{currentIndex + 1} / {questions.length}</span>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
            >
              下一题
            </button>
          </div>
        </main>
      </div>
      {/* Confirm modal */}
      {showConfirm && (
        <div className="exam-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="exam-modal" onClick={(e) => e.stopPropagation()}>
            <h3>确认交卷？</h3>
            <p>
              你已完成 <strong>{answeredCount}</strong>/{questions.length} 题。
              {answeredCount < questions.length && (
                <span className="exam-modal-warn">还有 {questions.length - answeredCount} 题未作答。</span>
              )}
            </p>
            <div className="exam-modal-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowConfirm(false)}
              >
                继续答题
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                onClick={() => handleSubmit(answers, attempt.id)}
              >
                {submitting ? '提交中...' : '确认交卷'}
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .exam-page { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
        .exam-timer-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.6rem 1.25rem;
          background: #fff;
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .exam-timer-bar.urgent {
          background: #fff5f5;
          border-bottom-color: rgba(239, 68, 68, 0.2);
        }
        .exam-timer-left {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text);
          font-weight: 600;
        }
        .exam-timer-bar.urgent .exam-timer-left {
          color: #dc2626;
        }
        .exam-timer-text { font-size: 1.1rem; font-variant-numeric: tabular-nums; }
        .exam-timer-center { font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; }
        .exam-timer-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.84rem;
          color: var(--text-muted);
        }
        .exam-submit-btn { padding: 0.4rem 0.8rem; font-size: 0.82rem; }
        .exam-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }
        .exam-nav {
          width: 180px;
          padding: 1rem;
          border-right: 1px solid var(--border-light);
          overflow-y: auto;
          flex-shrink: 0;
          background: #fafbfc;
        }
        .exam-nav h4 {
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }
        .exam-nav-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.4rem;
        }
        .exam-nav-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: #fff;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
        }
        .exam-nav-btn.current {
          border-color: var(--primary);
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 700;
        }
        .exam-nav-btn.answered {
          background: #ecfdf5;
          border-color: #10b981;
          color: #059669;
        }
        .exam-nav-btn.current.answered {
          background: var(--primary-light);
          border-color: var(--primary);
          color: var(--primary);
        }
        .exam-content {
          flex: 1;
          padding: 1.5rem 2rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        .exam-question-card {
          flex: 1;
        }
        .exam-question-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 1rem;
        }
        .exam-question-index {
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          background: var(--primary-light);
          color: var(--primary);
          font-size: 0.78rem;
          font-weight: 600;
        }
        .exam-question-type {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .exam-question-score {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }
        .exam-question-prompt {
          font-size: 1rem;
          color: var(--text);
          line-height: 1.8;
          white-space: pre-line;
          margin-bottom: 1.25rem;
        }
        .exam-options {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .exam-option {
          display: flex;
          align-items: flex-start;
          gap: 0.6rem;
          padding: 0.85rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          cursor: pointer;
          transition: all 0.15s;
        }
        .exam-option:hover {
          border-color: var(--primary);
          background: rgba(79, 110, 247, 0.03);
        }
        .exam-option.selected {
          border-color: var(--primary);
          background: var(--primary-light);
        }
        .exam-option input { display: none; }
        .exam-option-key {
          min-width: 1.4rem;
          font-weight: 600;
          color: var(--primary);
        }
        .exam-option-text { color: var(--text); line-height: 1.6; }
        .exam-textarea {
          width: 100%;
          padding: 0.85rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 0.95rem;
          line-height: 1.7;
          resize: vertical;
          font-family: inherit;
          transition: border-color 0.15s;
        }
        .exam-textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.1);
        }
        .exam-question-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 1rem;
          border-top: 1px solid var(--border-light);
          margin-top: 1.5rem;
        }
        .exam-question-pos {
          font-size: 0.84rem;
          color: var(--text-muted);
        }
        .exam-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .exam-modal {
          background: #fff;
          border-radius: var(--radius);
          padding: 1.5rem;
          max-width: 400px;
          width: 90%;
          box-shadow: var(--shadow-lg);
        }
        .exam-modal h3 {
          font-size: 1.1rem;
          margin-bottom: 0.75rem;
        }
        .exam-modal p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin-bottom: 1.25rem;
          line-height: 1.6;
        }
        .exam-modal-warn {
          color: #dc2626;
          display: block;
          margin-top: 0.35rem;
        }
        .exam-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.6rem;
        }
        @media (max-width: 768px) {
          .exam-nav { display: none; }
          .exam-content { padding: 1rem; }
          .exam-timer-center { display: none; }
        }
      `}</style>
    </div>
  );
}
