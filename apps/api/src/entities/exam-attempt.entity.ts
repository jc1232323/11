import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

export type ExamReport = {
  totalScore: number;
  earnedScore: number;
  percentage: number;
  grade: string;
  duration: number; // seconds taken
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

@Entity('exam_attempts')
export class ExamAttempt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'exam_id', type: 'varchar', length: 64 })
  examId!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId!: string;

  /** JSON: { questionId: userAnswer } */
  @Column({ type: 'simple-json', nullable: true })
  answers!: Record<string, string> | null;

  @Column({ type: 'int', nullable: true })
  score!: number | null;

  @Column({ name: 'total_score', type: 'int' })
  totalScore!: number;

  /** JSON report with detailed analysis */
  @Column({ type: 'simple-json', nullable: true })
  report!: ExamReport | null;

  @CreateDateColumn({ name: 'started_at' })
  startedAt!: Date;

  @Column({ name: 'submitted_at', type: 'datetime', nullable: true })
  submittedAt!: Date | null;
}
