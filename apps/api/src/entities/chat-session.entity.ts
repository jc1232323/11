import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ChatMessage } from './chat-message.entity';
import type { RoleId } from '../common/role-prompts';

@Entity('chat_sessions')
export class ChatSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User, (user) => user.chatSessions, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ default: '新对话' })
  title!: string;

  @Column({ name: 'role_mode', type: 'varchar', length: 32, default: 'guide' })
  roleMode!: RoleId;

  @OneToMany(() => ChatMessage, (message) => message.session)
  messages!: ChatMessage[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
