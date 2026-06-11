import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { LlmModule } from './llm/llm.module';
import { KnowledgeModule } from './knowledge/knowledge.module';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatSession } from './entities/chat-session.entity';
import { KnowledgeNode } from './entities/knowledge-node.entity';
import { User } from './entities/user.entity';
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
      entities: [User, KnowledgeNode, ChatSession, ChatMessage],
      synchronize: true,
    }),
    LlmModule,
    AuthModule,
    UsersModule,
    KnowledgeModule,
    ChatModule,
  ],
})
export class AppModule {}
