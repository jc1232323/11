import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import { ChatSession } from '../entities/chat-session.entity';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatSession, ChatMessage]),
    KnowledgeModule,
  ],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
