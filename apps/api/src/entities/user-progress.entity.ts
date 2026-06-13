import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_progress')
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId!: string;

  @Column({ name: 'topic_slug', type: 'varchar', length: 255 })
  topicSlug!: string;

  @CreateDateColumn({ name: 'viewed_at' })
  viewedAt!: Date;
}
