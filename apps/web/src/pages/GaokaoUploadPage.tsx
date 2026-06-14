import { FormEvent, useState } from 'react';
import { motion } from 'framer-motion';
import { api, ApiError } from '../lib/api';
import { Upload, Plus, Trash2, Save, CheckCircle } from 'lucide-react';
import { getGaokaoPaperList } from '../lib/exam-fallback';

type QuestionInput = {
  title: string;
  type: '单选题' | '填空题' | '综合题';
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  answer: string;
  analysis: string;
  knowledgePoints: string;
  source: string;
};

const EMPTY_QUESTION: QuestionInput = {
  title: '',
  type: '单选题',
  prompt: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  answer: '',
  analysis: '',
  knowledgePoints: '',
  source: '',
};

export function GaokaoUploadPage() {
  const [selectedPaper, setSelectedPaper] = useState('');
  const [questions, setQuestions] = useState<QuestionInput[]>([{ ...EMPTY_QUESTION }]);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const papers = getGaokaoPaperList();

  function addQuestion() {
    setQuestions([...questions, { ...EMPTY_QUESTION }]);
  }

  function removeQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, field: keyof QuestionInput, value: string) {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedPaper) {
      setError('请先选择要上传的试卷');
      return;
    }
    if (questions.some((q) => !q.title || !q.prompt || !q.answer)) {
      setError('请确保每道题都填写了标题、题目和答案');
      return;
    }

    setError('');
    setSaving(true);
    try {
      const formatted = questions.map((q, i) => ({
        id: `${selectedPaper}-q${i + 1}`,
        title: q.title,
        type: q.type,
        prompt: q.prompt,
        options: q.type === '单选题' ? [
          { key: 'A', text: q.optionA },
          { key: 'B', text: q.optionB },
          { key: 'C', text: q.optionC },
          { key: 'D', text: q.optionD },
        ] : null,
        answer: q.answer,
        analysis: q.analysis,
        knowledgePoints: q.knowledgePoints.split(/[,，、]/).map((s) => s.trim()).filter(Boolean),
        source: q.source || papers.find((p) => p.examId === selectedPaper)?.title || '',
      }));

      await api('/exam/gaokao-upload', {
        method: 'POST',
        body: JSON.stringify({ examId: selectedPaper, questions: formatted }),
      });
      setSuccess(`成功上传 ${formatted.length} 道题目到「${papers.find((p) => p.examId === selectedPaper)?.title}」`);
      setQuestions([{ ...EMPTY_QUESTION }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : '上传失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container gaokao-upload-page">
      <motion.header
        className="gu-header"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="gu-header-icon">
          <Upload size={24} strokeWidth={1.6} />
        </div>
        <div>
          <h1>上传高考真题</h1>
          <p className="gu-header-desc">选择试卷后逐题填写内容，保存后即可在模拟考试中使用</p>
        </div>
      </motion.header>

      {success && (
        <div className="gu-success">
          <CheckCircle size={18} strokeWidth={2} />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={onSubmit}>
        {/* Paper selector */}
        <div className="gu-paper-select card">
          <h2>选择试卷</h2>
          <select
            className="gu-select"
            value={selectedPaper}
            onChange={(e) => { setSelectedPaper(e.target.value); setSuccess(''); }}
          >
            <option value="">-- 选择年份和地区 --</option>
            {papers.map((p) => (
              <option key={p.examId} value={p.examId}>
                {p.title} {p.questionCount > 0 ? `（已有${p.questionCount}题）` : '（空）'}
              </option>
            ))}
          </select>
        </div>

        {/* Questions */}
        {selectedPaper && (
          <div className="gu-questions">
            <div className="gu-questions-head">
              <h2>题目内容（共 {questions.length} 题）</h2>
              <button type="button" className="btn btn-ghost gu-add-btn" onClick={addQuestion}>
                <Plus size={16} strokeWidth={2} />
                添加一题
              </button>
            </div>

            {questions.map((q, index) => (
              <div key={index} className="card gu-question-card">
                <div className="gu-q-head">
                  <span className="gu-q-num">第 {index + 1} 题</span>
                  {questions.length > 1 && (
                    <button type="button" className="gu-q-delete" onClick={() => removeQuestion(index)}>
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>

                <div className="gu-q-row">
                  <div className="gu-q-field">
                    <label>标题</label>
                    <input value={q.title} onChange={(e) => updateQuestion(index, 'title', e.target.value)} placeholder="如：化学与生活" required />
                  </div>
                  <div className="gu-q-field gu-q-field-sm">
                    <label>题型</label>
                    <select value={q.type} onChange={(e) => updateQuestion(index, 'type', e.target.value as QuestionInput['type'])}>
                      <option value="单选题">单选题</option>
                      <option value="填空题">填空题</option>
                      <option value="综合题">综合题</option>
                    </select>
                  </div>
                </div>

                <div className="gu-q-field">
                  <label>题目正文</label>
                  <textarea value={q.prompt} onChange={(e) => updateQuestion(index, 'prompt', e.target.value)} placeholder="粘贴题目内容..." rows={4} required />
                </div>

                {q.type === '单选题' && (
                  <div className="gu-q-options">
                    <div className="gu-q-field"><label>A</label><input value={q.optionA} onChange={(e) => updateQuestion(index, 'optionA', e.target.value)} placeholder="选项A" /></div>
                    <div className="gu-q-field"><label>B</label><input value={q.optionB} onChange={(e) => updateQuestion(index, 'optionB', e.target.value)} placeholder="选项B" /></div>
                    <div className="gu-q-field"><label>C</label><input value={q.optionC} onChange={(e) => updateQuestion(index, 'optionC', e.target.value)} placeholder="选项C" /></div>
                    <div className="gu-q-field"><label>D</label><input value={q.optionD} onChange={(e) => updateQuestion(index, 'optionD', e.target.value)} placeholder="选项D" /></div>
                  </div>
                )}

                <div className="gu-q-row">
                  <div className="gu-q-field">
                    <label>答案</label>
                    <input value={q.answer} onChange={(e) => updateQuestion(index, 'answer', e.target.value)} placeholder={q.type === '单选题' ? '如：B' : '填写完整答案'} required />
                  </div>
                  <div className="gu-q-field">
                    <label>考点（逗号分隔）</label>
                    <input value={q.knowledgePoints} onChange={(e) => updateQuestion(index, 'knowledgePoints', e.target.value)} placeholder="如：离子反应,氧化还原" />
                  </div>
                </div>

                <div className="gu-q-field">
                  <label>解析（可选）</label>
                  <textarea value={q.analysis} onChange={(e) => updateQuestion(index, 'analysis', e.target.value)} placeholder="解题思路和答案解析..." rows={3} />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="gu-error">{error}</p>}

        {selectedPaper && (
          <div className="gu-submit-bar">
            <button type="submit" className="btn btn-primary gu-submit-btn" disabled={saving}>
              <Save size={16} strokeWidth={2} />
              {saving ? '保存中...' : `保存 ${questions.length} 道题目`}
            </button>
          </div>
        )}
      </form>

      <style>{`
        .gaokao-upload-page { padding-bottom: 3rem; max-width: 800px; }
        .gu-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .gu-header-icon {
          width: 48px; height: 48px; border-radius: var(--radius);
          background: rgba(239,68,68,0.08); color: #ef4444;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .gu-header h1 { font-size: 1.4rem; font-weight: 700; color: var(--text); margin-bottom: 0.15rem; }
        .gu-header-desc { color: var(--text-muted); font-size: 0.9rem; }
        .gu-success {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.75rem 1rem; border-radius: var(--radius);
          background: rgba(16,185,129,0.08); color: #059669;
          font-size: 0.88rem; font-weight: 500; margin-bottom: 1.25rem;
        }
        .gu-paper-select { padding: 1.25rem; margin-bottom: 1.25rem; }
        .gu-paper-select h2 { font-size: 1rem; font-weight: 600; color: var(--text); margin-bottom: 0.75rem; }
        .gu-select {
          width: 100%; padding: 0.6rem 0.8rem;
          border: 1.5px solid var(--border); border-radius: var(--radius);
          background: var(--bg); font-size: 0.9rem; color: var(--text); cursor: pointer;
        }
        .gu-select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-glow); }
        .gu-questions-head {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
        }
        .gu-questions-head h2 { font-size: 1rem; font-weight: 600; color: var(--text); }
        .gu-add-btn { font-size: 0.84rem; }
        .gu-question-card { padding: 1.25rem; margin-bottom: 1rem; }
        .gu-q-head {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;
        }
        .gu-q-num {
          font-size: 0.8rem; font-weight: 700; color: var(--primary);
          background: var(--primary-light); padding: 0.2rem 0.6rem; border-radius: 999px;
        }
        .gu-q-delete {
          border: none; background: none; color: var(--text-muted); cursor: pointer;
          padding: 0.3rem; border-radius: 4px;
        }
        .gu-q-delete:hover { color: var(--danger); background: rgba(239,68,68,0.06); }
        .gu-q-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem; }
        .gu-q-field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.75rem; }
        .gu-q-field-sm { max-width: 160px; }
        .gu-q-field label { font-size: 0.78rem; font-weight: 500; color: var(--text-muted); }
        .gu-q-field input, .gu-q-field textarea, .gu-q-field select {
          padding: 0.5rem 0.7rem; border: 1.5px solid var(--border); border-radius: var(--radius-sm);
          background: var(--bg); font-size: 0.88rem; color: var(--text); resize: vertical;
        }
        .gu-q-field input:focus, .gu-q-field textarea:focus, .gu-q-field select:focus {
          outline: none; border-color: var(--primary); box-shadow: 0 0 0 2px var(--primary-glow);
        }
        .gu-q-options { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 0.75rem; }
        .gu-error {
          color: var(--danger); font-size: 0.85rem; margin: 1rem 0;
          padding: 0.5rem 0.75rem; background: rgba(239,68,68,0.06); border-radius: var(--radius-sm);
        }
        .gu-submit-bar { margin-top: 1.5rem; text-align: center; }
        .gu-submit-btn { padding: 0.75rem 1.5rem; font-size: 0.95rem; }
        @media (max-width: 768px) {
          .gu-q-row, .gu-q-options { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
