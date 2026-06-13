import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';
import { ProgressService } from './progress.service';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Post('view')
  recordView(@CurrentUser() user: User, @Body() body: { topicSlug: string }) {
    return this.progress.recordView(user.id, body.topicSlug);
  }

  @Post('answer')
  recordAnswer(
    @CurrentUser() user: User,
    @Body() body: { questionId: string; correct: boolean },
  ) {
    return this.progress.recordAnswer(user.id, body.questionId, body.correct);
  }

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    return this.progress.getStats(user.id);
  }

  /** Returns list of topic slugs the user has viewed */
  @Get('viewed-topics')
  getViewedTopics(@CurrentUser() user: User) {
    return this.progress.getViewedTopicSlugs(user.id);
  }
}
