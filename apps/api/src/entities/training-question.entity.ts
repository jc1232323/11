import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('training_questions')
export class TrainingQuestion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** References training_packs.pack_id */
  @Column({ name: 'pack_id', type: 'varchar', length: 64 })
  packId!: string;

  @Column()
  title!: string;

  /** '单选题' | '填空题' | '综合题' */
  @Column({ type: 'varchar', length: 16 })
  type!: string;

  @Column({ type: 'text' })
  prompt!: string;

  /** JSON array of {key, text} or null */
  @Column({ type: 'json', nullable: true })
  options!: Array<{ key: string; text: string }> | null;

  @Column({ type: 'text' })
  answer!: string;

  @Column({ type: 'text' })
  analysis!: string;

  /** JSON array of knowledge point strings */
  @Column({ name: 'knowledge_points', type: 'json' })
  knowledgePoints!: string[];

  @Column({ type: 'varchar', length: 255 })
  source!: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;
}
