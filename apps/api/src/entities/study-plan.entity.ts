import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('study_plans')
export class StudyPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId!: string;

  /** 目标分数 */
  @Column({ name: 'target_score', type: 'int' })
  targetScore!: number;

  /** 年级: '高一' | '高二' | '高三' */
  @Column({ type: 'varchar', length: 16 })
  grade!: string;

  /** 目标学校 */
  @Column({ name: 'target_school', type: 'varchar', length: 128 })
  targetSchool!: string;

  /** 薄弱环节（可选） */
  @Column({ name: 'weak_points', type: 'text', nullable: true })
  weakPoints!: string | null;

  /** AI 生成的计划 JSON */
  @Column({ name: 'plan_content', type: 'longtext' })
  planContent!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
