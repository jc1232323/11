import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('knowledge_nodes')
export class KnowledgeNode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'parent_id', type: 'varchar', length: 36, nullable: true })
  parentId!: string | null;

  @Column({ unique: true })
  slug!: string;

  @Column()
  title!: string;

  @Column({ type: 'varchar', length: 32, default: 'chapter' })
  type!: 'module' | 'chapter' | 'topic';

  @Column({ name: 'sort_order', default: 0 })
  sortOrder!: number;

  @Column({ name: 'md_body', type: 'longtext', nullable: true })
  mdBody!: string | null;
}
