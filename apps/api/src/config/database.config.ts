import { mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import type { DataSourceOptions } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatSession } from '../entities/chat-session.entity';
import { Exam } from '../entities/exam.entity';
import { ExamAttempt } from '../entities/exam-attempt.entity';
import { Favorite } from '../entities/favorite.entity';
import { KnowledgeNode } from '../entities/knowledge-node.entity';
import { PracticeRecord } from '../entities/practice-record.entity';
import { StudyPlan } from '../entities/study-plan.entity';
import { TrainingPack } from '../entities/training-pack.entity';
import { TrainingQuestion } from '../entities/training-question.entity';
import { User } from '../entities/user.entity';
import { UserProgress } from '../entities/user-progress.entity';

export const appEntities = [
  User,
  KnowledgeNode,
  ChatSession,
  ChatMessage,
  UserProgress,
  PracticeRecord,
  Favorite,
  TrainingPack,
  TrainingQuestion,
  Exam,
  ExamAttempt,
  StudyPlan,
];

function ensureSqliteDirectory(databasePath: string) {
  if (databasePath === ':memory:') return;
  mkdirSync(dirname(databasePath), { recursive: true });
}

export function buildDataSourceOptions(): DataSourceOptions {
  const databaseType = (process.env.DATABASE_TYPE ?? 'mysql').toLowerCase();

  if (databaseType === 'sqlite') {
    const databasePath = resolve(
      process.cwd(),
      process.env.DATABASE_PATH ?? './data/chem-qa.sqlite',
    );
    ensureSqliteDirectory(databasePath);

    return {
      type: 'sqljs',
      location: databasePath,
      autoSave: true,
      entities: appEntities,
      synchronize: true,
    };
  }

  return {
    type: 'mysql',
    host: process.env.DATABASE_HOST ?? '127.0.0.1',
    port: Number(process.env.DATABASE_PORT ?? 3307),
    username: process.env.DATABASE_USER ?? 'chem_user',
    password: process.env.DATABASE_PASSWORD ?? 'chem_pass_dev_2026',
    database: process.env.DATABASE_NAME ?? 'chem_qa',
    entities: appEntities,
    synchronize: true,
  };
}

export function buildTypeOrmOptions(): TypeOrmModuleOptions {
  return buildDataSourceOptions() as TypeOrmModuleOptions;
}
