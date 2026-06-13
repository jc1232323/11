import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Short string key like 'gaokao-2024-mock1' */
  @Column({ name: 'exam_id', type: 'varchar', length: 64, unique: true })
  examId!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  /** Duration in minutes */
  @Column({ type: 'int' })
  duration!: number;

  /** Total possible score */
  @Column({ name: 'total_score', type: 'int' })
  totalScore!: number;

  /** JSON array of {questionId, score} */
  @Column({ type: 'json' })
  questions!: Array<{ questionId: string; score: number }>;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
