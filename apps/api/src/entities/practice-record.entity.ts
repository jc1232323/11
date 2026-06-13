import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('practice_records')
export class PracticeRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId!: string;

  @Column({ name: 'question_id', type: 'varchar', length: 36 })
  questionId!: string;

  @Column({ default: false })
  correct!: boolean;

  @CreateDateColumn({ name: 'answered_at' })
  answeredAt!: Date;
}
