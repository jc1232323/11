import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { ChatModule } from './chat/chat.module';
import { ExamModule } from './exam/exam.module';
import { FavoritesModule } from './favorites/favorites.module';
import { LlmModule } from './llm/llm.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { MailModule } from './mail/mail.module';
import { ProgressModule } from './progress/progress.module';
import { StudyPlanModule } from './study-plan/study-plan.module';
import { TrainingModule } from './training/training.module';
import { UsersModule } from './users/users.module';
import { buildTypeOrmOptions } from './config/database.config';

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
    TypeOrmModule.forRoot(buildTypeOrmOptions()),
    MailModule,
    LlmModule,
    AuthModule,
    AdminModule,
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
