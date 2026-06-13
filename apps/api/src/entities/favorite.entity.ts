import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 36 })
  userId!: string;

  /** 'topic' for knowledge points, 'question' for wrong questions */
  @Column({ type: 'varchar', length: 32 })
  type!: 'topic' | 'question';

  /** slug for topics, question UUID for questions */
  @Column({ name: 'target_id', type: 'varchar', length: 255 })
  targetId!: string;

  @Column({ type: 'text', nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
