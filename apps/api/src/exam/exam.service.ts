import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from '../entities/exam.entity';
import { ExamAttempt, ExamReport } from '../entities/exam-attempt.entity';
import { TrainingQuestion } from '../entities/training-question.entity';

@Injectable()
export class ExamService {
  constructor(
    @InjectRepository(Exam) private readonly exams: Repository<Exam>,
    @InjectRepository(ExamAttempt) private readonly attempts: Repository<ExamAttempt>,
    @InjectRepository(TrainingQuestion) private readonly questions: Repository<TrainingQuestion>,
  ) {}

  async listExams() {
    return this.exams.find({ order: { sortOrder: 'ASC' } });
  }

  async getExam(examId: string) {
    const exam = await this.exams.findOne({ where: { examId } });
    if (!exam) throw new NotFoundException('试卷不存在');

    // Fetch actual question data
    const questionIds = exam.questions.map((q) => q.questionId);
    const questionEntities = await this.questions
      .createQueryBuilder('q')
      .where('q.id IN (:...ids)', { ids: questionIds })
      .getMany();

    const questionMap = new Map(questionEntities.map((q) => [q.id, q]));
    const questionsWithScore = exam.questions.map((item) => ({
      ...questionMap.get(item.questionId),
      score: item.score,
    }));

    return { ...exam, questionDetails: questionsWithScore };
  }

  async startAttempt(userId: string, examId: string) {
    const exam = await this.exams.findOne({ where: { examId } });
    if (!exam) throw new NotFoundException('试卷不存在');

    // Check if user has an ongoing attempt (started but not submitted)
    const ongoing = await this.attempts.findOne({
      where: { userId, examId, submittedAt: undefined },
    });

    // Use IsNull for TypeORM null comparison
    const ongoingAttempt = await this.attempts
      .createQueryBuilder('a')
      .where('a.user_id = :userId', { userId })
      .andWhere('a.exam_id = :examId', { examId })
      .andWhere('a.submitted_at IS NULL')
      .getOne();

    if (ongoingAttempt) {
      // Check if time expired
      const elapsed = (Date.now() - new Date(ongoingAttempt.startedAt).getTime()) / 1000;
      if (elapsed < exam.duration * 60) {
        // Still within time limit, return existing attempt
        return ongoingAttempt;
      }
      // Time expired, auto-submit with empty answers
      await this.submitAttempt(ongoingAttempt.id, userId, ongoingAttempt.answers ?? {});
    }

    const attempt = this.attempts.create({
      examId,
      userId,
      totalScore: exam.totalScore,
      answers: null,
      score: null,
      report: null,
    });

    return this.attempts.save(attempt);
  }

  async submitAttempt(attemptId: string, userId: string, answers: Record<string, string>) {
    const attempt = await this.attempts.findOne({ where: { id: attemptId, userId } });
    if (!attempt) throw new NotFoundException('考试记录不存在');
    if (attempt.submittedAt) throw new BadRequestException('试卷已提交');

    const exam = await this.exams.findOne({ where: { examId: attempt.examId } });
    if (!exam) throw new NotFoundException('试卷不存在');

    // Fetch all questions for grading
    const questionIds = exam.questions.map((q) => q.questionId);
    const questionEntities = await this.questions
      .createQueryBuilder('q')
      .where('q.id IN (:...ids)', { ids: questionIds })
      .getMany();
    const questionMap = new Map(questionEntities.map((q) => [q.id, q]));

    // Grade each question
    const questionResults: ExamReport['questionResults'] = [];
    let earnedScore = 0;

    for (const item of exam.questions) {
      const question = questionMap.get(item.questionId);
      if (!question) continue;

      const userAnswer = (answers[item.questionId] ?? '').trim();
      const correctAnswer = question.answer.trim();
      const correct = this.gradeAnswer(question.type, userAnswer, correctAnswer);
      const points = correct ? item.score : 0;
      earnedScore += points;

      questionResults.push({
        questionId: item.questionId,
        correct,
        earnedScore: points,
        maxScore: item.score,
        userAnswer,
        correctAnswer,
      });
    }

    // Knowledge point analysis
    const pointMap = new Map<string, { total: number; correct: number }>();
    for (const result of questionResults) {
      const question = questionMap.get(result.questionId);
      if (!question) continue;
      for (const point of question.knowledgePoints) {
        const existing = pointMap.get(point) ?? { total: 0, correct: 0 };
        existing.total++;
        if (result.correct) existing.correct++;
        pointMap.set(point, existing);
      }
    }

    const knowledgePointAnalysis = [...pointMap.entries()].map(([point, data]) => ({
      point,
      total: data.total,
      correct: data.correct,
      percentage: Math.round((data.correct / data.total) * 100),
    }));

    // Identify weak points (below 60% correct)
    const weakPoints = knowledgePointAnalysis
      .filter((p) => p.percentage < 60)
      .map((p) => p.point);

    const percentage = Math.round((earnedScore / exam.totalScore) * 100);
    const grade = this.getGrade(percentage);
    const duration = Math.round((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);

    const report: ExamReport = {
      totalScore: exam.totalScore,
      earnedScore,
      percentage,
      grade,
      duration,
      questionResults,
      knowledgePointAnalysis,
      weakPoints,
    };

    attempt.answers = answers;
    attempt.score = earnedScore;
    attempt.submittedAt = new Date();
    attempt.report = report;

    return this.attempts.save(attempt);
  }

  async getAttempt(attemptId: string, userId: string) {
    const attempt = await this.attempts.findOne({ where: { id: attemptId, userId } });
    if (!attempt) throw new NotFoundException('考试记录不存在');
    return attempt;
  }

  async listMyAttempts(userId: string) {
    return this.attempts.find({
      where: { userId },
      order: { startedAt: 'DESC' },
    });
  }

  private gradeAnswer(type: string, userAnswer: string, correctAnswer: string): boolean {
    if (!userAnswer) return false;

    if (type === '单选题') {
      return userAnswer.toUpperCase() === correctAnswer.toUpperCase();
    }

    // For fill-in and comprehensive questions, do keyword matching
    const normalizedUser = userAnswer.replace(/\s+/g, '').toLowerCase();
    const normalizedCorrect = correctAnswer.replace(/\s+/g, '').toLowerCase();

    if (normalizedUser === normalizedCorrect) return true;

    // Check if the correct answer's key terms appear in user's answer
    const keywords = normalizedCorrect
      .split(/[，,、；;。.]+/)
      .filter((k) => k.length > 1);

    if (keywords.length === 0) return normalizedUser === normalizedCorrect;

    const matchCount = keywords.filter((kw) => normalizedUser.includes(kw)).length;
    return matchCount / keywords.length >= 0.6;
  }

  private getGrade(percentage: number): string {
    if (percentage >= 90) return '优秀';
    if (percentage >= 80) return '良好';
    if (percentage >= 70) return '中等';
    if (percentage >= 60) return '及格';
    return '不及格';
  }
}
