import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';
import { isPremium } from '../common/membership';
import { ExamService } from './exam.service';

@Controller('exam')
@UseGuards(JwtAuthGuard)
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get('papers')
  listExams() {
    return this.examService.listExams();
  }

  @Get('papers/:examId')
  getExam(@Param('examId') examId: string) {
    return this.examService.getExam(examId);
  }

  @Post('start')
  startAttempt(
    @CurrentUser() user: User,
    @Body('examId') examId: string,
  ) {
    if (!isPremium(user)) {
      throw new ForbiddenException('模拟考试为会员专属功能，请升级会员');
    }
    return this.examService.startAttempt(user.id, examId);
  }

  @Post('submit')
  submitAttempt(
    @CurrentUser() user: User,
    @Body('attemptId') attemptId: string,
    @Body('answers') answers: Record<string, string>,
  ) {
    return this.examService.submitAttempt(attemptId, user.id, answers);
  }

  @Get('attempts')
  listMyAttempts(@CurrentUser() user: User) {
    return this.examService.listMyAttempts(user.id);
  }

  @Get('attempts/:attemptId')
  getAttempt(
    @CurrentUser() user: User,
    @Param('attemptId') attemptId: string,
  ) {
    return this.examService.getAttempt(attemptId, user.id);
  }
}
