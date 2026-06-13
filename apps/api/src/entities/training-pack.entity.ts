import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('training_packs')
export class TrainingPack {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** Short string key like 'electrochemistry' */
  @Column({ name: 'pack_id', type: 'varchar', length: 64, unique: true })
  packId!: string;

  @Column()
  title!: string;

  @Column({ type: 'varchar', length: 16 })
  color!: string;

  @Column({ type: 'text' })
  description!: string;

  /** JSON array of tag strings */
  @Column({ type: 'json' })
  tags!: string[];

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;
}
