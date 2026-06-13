import { TRAINING_PACKS, type TrainingQuestion, type TrainingQuestionType } from './training-packs';

type ExamQuestionScore = {
  questionId: string;
  score: number;
};

export type FallbackExamPaper = {
  examId: string;
  title: string;
  description: string;
  duration: number;
  totalScore: number;
  questions: ExamQuestionScore[];
};

export type FallbackExamQuestionDetail = {
  id: string;
  title: string;
  type: TrainingQuestionType;
  prompt: string;
  options: Array<{ key: string; text: string }> | null;
  answer: string;
  analysis: string;
  knowledgePoints: string[];
  source: string;
  score: number;
};

export type FallbackExamDetail = Omit<FallbackExamPaper, 'questions'> & {
  questionDetails: FallbackExamQuestionDetail[];
};

export type FallbackExamReport = {
  totalScore: number;
  earnedScore: number;
  percentage: number;
  grade: string;
  duration: number;
  questionResults: Array<{
    questionId: string;
    correct: boolean;
    earnedScore: number;
    maxScore: number;
    userAnswer: string;
    correctAnswer: string;
  }>;
  knowledgePointAnalysis: Array<{
    point: string;
    total: number;
    correct: number;
    percentage: number;
  }>;
  weakPoints: string[];
};

export type FallbackExamAttempt = {
  id: string;
  examId: string;
  score: number | null;
  totalScore: number;
  startedAt: string;
  submittedAt: string | null;
  answers: Record<string, string> | null;
  report: FallbackExamReport | null;
};

const STORAGE_KEY = 'chem-qa:fallback-exam-attempts';
const ALL_QUESTIONS = TRAINING_PACKS.flatMap((pack) => pack.questions);
const QUESTION_MAP = new Map(ALL_QUESTIONS.map((question) => [question.id, question]));
const CHOICE_QUESTIONS = ALL_QUESTIONS.filter((question) => question.type === '单选题');
const WRITTEN_QUESTIONS = ALL_QUESTIONS.filter((question) => question.type !== '单选题');
const ORGANIC_QUESTIONS = TRAINING_PACKS.find((pack) => pack.id === 'organic')?.questions ?? [];

function buildPaper(
  examId: string,
  title: string,
  description: string,
  duration: number,
  questions: Array<{ question: TrainingQuestion; score: number }>,
): FallbackExamPaper {
  return {
    examId,
    title,
    description,
    duration,
    totalScore: questions.reduce((sum, item) => sum + item.score, 0),
    questions: questions.map((item) => ({
      questionId: item.question.id,
      score: item.score,
    })),
  };
}

const FALLBACK_EXAM_PAPERS: FallbackExamPaper[] = [
  buildPaper(
    'comprehensive-mock-1',
    '高考化学综合模拟卷（一）',
    '涵盖电化学、实验、有机化学等高考重点内容，开箱即用的内置模拟卷。',
    45,
    [
      ...CHOICE_QUESTIONS.slice(0, 8).map((question) => ({ question, score: 3 })),
      ...WRITTEN_QUESTIONS.slice(0, 4).map((question) => ({ question, score: 8 })),
    ],
  ),
  buildPaper(
    'choice-sprint',
    '选择题限时冲刺',
    '内置选择题快练卷，适合先做一轮限时热身。',
    20,
    CHOICE_QUESTIONS.map((question) => ({ question, score: 4 })),
  ),
  buildPaper(
    'organic-focus',
    '有机推断专项测试',
    '用内置有机推断题直接组成专项卷，不用先导入数据库。',
    25,
    ORGANIC_QUESTIONS.map((question) => ({
      question,
      score: question.type === '单选题' ? 4 : 10,
    })),
  ),
].filter((paper) => paper.questions.length > 0);

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function sortAttempts(attempts: FallbackExamAttempt[]) {
  return [...attempts].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );
}

function readAttempts() {
  if (!isBrowser()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as FallbackExamAttempt[]) : [];
  } catch {
    return [];
  }
}

function writeAttempts(attempts: FallbackExamAttempt[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortAttempts(attempts)));
}

function gradeAnswer(type: string, userAnswer: string, correctAnswer: string) {
  if (!userAnswer) return false;

  if (type === '单选题') {
    return userAnswer.toUpperCase() === correctAnswer.toUpperCase();
  }

  const normalizedUser = userAnswer.replace(/\s+/g, '').toLowerCase();
  const normalizedCorrect = correctAnswer.replace(/\s+/g, '').toLowerCase();
  if (normalizedUser === normalizedCorrect) return true;

  const keywords = normalizedCorrect
    .split(/[，,、；;。.]+/)
    .filter((keyword) => keyword.length > 1);

  if (keywords.length === 0) return normalizedUser === normalizedCorrect;

  const matched = keywords.filter((keyword) => normalizedUser.includes(keyword)).length;
  return matched / keywords.length >= 0.6;
}

function getGrade(percentage: number) {
  if (percentage >= 90) return '优秀';
  if (percentage >= 80) return '良好';
  if (percentage >= 70) return '中等';
  if (percentage >= 60) return '及格';
  return '不及格';
}

function createAttemptId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local-${crypto.randomUUID()}`;
  }

  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function finalizeAttempt(
  attempt: FallbackExamAttempt,
  answers: Record<string, string>,
  exam: FallbackExamDetail,
): FallbackExamAttempt {
  const questionResults: FallbackExamReport['questionResults'] = [];
  const pointMap = new Map<string, { total: number; correct: number }>();
  let earnedScore = 0;

  for (const question of exam.questionDetails) {
    const userAnswer = (answers[question.id] ?? '').trim();
    const correctAnswer = question.answer.trim();
    const correct = gradeAnswer(question.type, userAnswer, correctAnswer);
    const points = correct ? question.score : 0;

    earnedScore += points;
    questionResults.push({
      questionId: question.id,
      correct,
      earnedScore: points,
      maxScore: question.score,
      userAnswer,
      correctAnswer,
    });

    for (const point of question.knowledgePoints) {
      const current = pointMap.get(point) ?? { total: 0, correct: 0 };
      current.total += 1;
      if (correct) current.correct += 1;
      pointMap.set(point, current);
    }
  }

  const knowledgePointAnalysis = [...pointMap.entries()].map(([point, data]) => ({
    point,
    total: data.total,
    correct: data.correct,
    percentage: Math.round((data.correct / data.total) * 100),
  }));

  const weakPoints = knowledgePointAnalysis
    .filter((item) => item.percentage < 60)
    .map((item) => item.point);

  const duration = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
  const percentage = exam.totalScore === 0 ? 0 : Math.round((earnedScore / exam.totalScore) * 100);

  return {
    ...attempt,
    answers,
    score: earnedScore,
    submittedAt: new Date().toISOString(),
    report: {
      totalScore: exam.totalScore,
      earnedScore,
      percentage,
      grade: getGrade(percentage),
      duration,
      questionResults,
      knowledgePointAnalysis,
      weakPoints,
    },
  };
}

function normalizeAttempts(attempts: FallbackExamAttempt[]) {
  let changed = false;

  const normalized = attempts.map((attempt) => {
    if (attempt.submittedAt) return attempt;

    const exam = getFallbackExamDetail(attempt.examId);
    if (!exam) return attempt;

    const expiresAt = new Date(attempt.startedAt).getTime() + exam.duration * 60 * 1000;
    if (Date.now() < expiresAt) return attempt;

    changed = true;
    return finalizeAttempt(attempt, attempt.answers ?? {}, exam);
  });

  if (changed) {
    writeAttempts(normalized);
  }

  return sortAttempts(normalized);
}

export function getFallbackExamPapers() {
  return FALLBACK_EXAM_PAPERS;
}

export function getFallbackExamDetail(examId: string): FallbackExamDetail | null {
  const paper = FALLBACK_EXAM_PAPERS.find((item) => item.examId === examId);
  if (!paper) return null;

  const questionDetails = paper.questions
    .map((item) => {
      const question = QUESTION_MAP.get(item.questionId);
      if (!question) return null;

      return {
        id: question.id,
        title: question.title,
        type: question.type,
        prompt: question.prompt,
        options: question.options ?? null,
        answer: question.answer,
        analysis: question.analysis,
        knowledgePoints: question.knowledgePoints,
        source: question.source,
        score: item.score,
      };
    })
    .filter((question): question is FallbackExamQuestionDetail => question !== null);

  if (questionDetails.length === 0) {
    return null;
  }

  return {
    examId: paper.examId,
    title: paper.title,
    description: paper.description,
    duration: paper.duration,
    totalScore: paper.totalScore,
    questionDetails,
  };
}

export function listFallbackExamAttempts() {
  return normalizeAttempts(readAttempts());
}

export function getFallbackExamAttempt(attemptId: string) {
  return listFallbackExamAttempts().find((attempt) => attempt.id === attemptId) ?? null;
}

export function startFallbackExamAttempt(examId: string) {
  const exam = getFallbackExamDetail(examId);
  if (!exam) return null;

  const attempts = listFallbackExamAttempts();
  const existing = attempts.find((attempt) => attempt.examId === examId && !attempt.submittedAt);
  if (existing) {
    return existing;
  }

  const attempt: FallbackExamAttempt = {
    id: createAttemptId(),
    examId,
    score: null,
    totalScore: exam.totalScore,
    startedAt: new Date().toISOString(),
    submittedAt: null,
    answers: {},
    report: null,
  };

  writeAttempts([attempt, ...attempts]);
  return attempt;
}

export function submitFallbackExamAttempt(attemptId: string, answers: Record<string, string>) {
  const attempts = listFallbackExamAttempts();
  const index = attempts.findIndex((attempt) => attempt.id === attemptId);
  if (index === -1) return null;

  const attempt = attempts[index];
  if (attempt.submittedAt) return attempt;

  const exam = getFallbackExamDetail(attempt.examId);
  if (!exam) return null;

  const submitted = finalizeAttempt(attempt, answers, exam);
  const next = [...attempts];
  next[index] = submitted;
  writeAttempts(next);
  return submitted;
}
