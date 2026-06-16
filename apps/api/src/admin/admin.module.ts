import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { ChatSession } from '../entities/chat-session.entity';
import { ChatMessage } from '../entities/chat-message.entity';
import { ExamAttempt } from '../entities/exam-attempt.entity';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, ChatSession, ChatMessage, ExamAttempt]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
