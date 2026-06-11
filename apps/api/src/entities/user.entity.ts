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

  @Column({ name: 'email_verified', default: false })
  emailVerified!: boolean;

  @Column({ name: 'email_verify_token', type: 'varchar', length: 128, nullable: true })
  emailVerifyToken!: string | null;

  @Column({ name: 'email_verify_expires', type: 'datetime', nullable: true })
  emailVerifyExpires!: Date | null;

  @Column({ name: 'reset_password_token', type: 'varchar', length: 128, nullable: true })
  resetPasswordToken!: string | null;

  @Column({ name: 'reset_password_expires', type: 'datetime', nullable: true })
  resetPasswordExpires!: Date | null;

  @OneToMany(() => ChatSession, (session) => session.user)
  chatSessions!: ChatSession[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
