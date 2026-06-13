import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { ExamModule } from './exam/exam.module';
import { FavoritesModule } from './favorites/favorites.module';
import { LlmModule } from './llm/llm.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { MailModule } from './mail/mail.module';
import { ProgressModule } from './progress/progress.module';
import { StudyPlanModule } from './study-plan/study-plan.module';
import { TrainingModule } from './training/training.module';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatSession } from './entities/chat-session.entity';
import { Exam } from './entities/exam.entity';
import { ExamAttempt } from './entities/exam-attempt.entity';
import { Favorite } from './entities/favorite.entity';
import { KnowledgeNode } from './entities/knowledge-node.entity';
import { PracticeRecord } from './entities/practice-record.entity';
import { TrainingPack } from './entities/training-pack.entity';
import { TrainingQuestion } from './entities/training-question.entity';
import { StudyPlan } from './entities/study-plan.entity';
import { User } from './entities/user.entity';
import { UserProgress } from './entities/user-progress.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '../../../.env'),
        join(__dirname, '../../.env'),
        '.env',
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST ?? '127.0.0.1',
      port: Number(process.env.DATABASE_PORT ?? 3307),
      username: process.env.DATABASE_USER ?? 'chem_user',
      password: process.env.DATABASE_PASSWORD ?? 'chem_pass_dev_2026',
      database: process.env.DATABASE_NAME ?? 'chem_qa',
      entities: [
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
      ],
      synchronize: true,
    }),
    MailModule,
    LlmModule,
    AuthModule,
    UsersModule,
    KnowledgeModule,
    ChatModule,
    ProgressModule,
    FavoritesModule,
    TrainingModule,
    ExamModule,
    StudyPlanModule,
  ],
})
export class AppModule {}
