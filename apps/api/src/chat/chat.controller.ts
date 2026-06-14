import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';
import { isPremium } from '../common/membership';
import { ChatService } from './chat.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chat: ChatService) {}

  @Get('sessions')
  listSessions(@CurrentUser() user: User) {
    return this.chat.listSessions(user.id);
  }

  @Post('sessions')
  createSession(@CurrentUser() user: User, @Body() dto: CreateSessionDto) {
    return this.chat.createSession(user.id, dto, user);
  }

  @Patch('sessions/:id')
  updateSession(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.chat.updateSession(user.id, id, dto);
  }

  @Delete('sessions/:id')
  deleteSession(@CurrentUser() user: User, @Param('id') id: string) {
    return this.chat.deleteSession(user.id, id);
  }

  @Get('sessions/:id/messages')
  listMessages(@CurrentUser() user: User, @Param('id') id: string) {
    return this.chat.listMessages(user.id, id);
  }

  @Post('sessions/:id/messages')
  sendMessage(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @Res() res: Response,
  ) {
    return this.chat.streamReply(user, id, dto, res);
  }

  @Get('sessions/:id/export')
  exportSession(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Query('format') format: string,
  ) {
    if (!isPremium(user)) {
      throw new ForbiddenException('导出对话为会员专属功能，请升级会员');
    }
    return this.chat.exportSession(user.id, id, format || 'md');
  }
}
