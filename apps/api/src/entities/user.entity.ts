import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ChatSession } from './chat-session.entity';
import type { RoleId } from '../common/role-prompts';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ default: '' })
  nickname!: string;

  @Column({ name: 'default_role', type: 'varchar', length: 32, default: 'guide' })
  defaultRole!: RoleId;

  @OneToMany(() => ChatSession, (session) => session.user)
  chatSessions!: ChatSession[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
