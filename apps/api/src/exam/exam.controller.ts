import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
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
    @CurrentUser() user: { id: string },
    @Body('examId') examId: string,
  ) {
    return this.examService.startAttempt(user.id, examId);
  }

  @Post('submit')
  submitAttempt(
    @CurrentUser() user: { id: string },
    @Body('attemptId') attemptId: string,
    @Body('answers') answers: Record<string, string>,
  ) {
    return this.examService.submitAttempt(attemptId, user.id, answers);
  }

  @Get('attempts')
  listMyAttempts(@CurrentUser() user: { id: string }) {
    return this.examService.listMyAttempts(user.id);
  }

  @Get('attempts/:attemptId')
  getAttempt(
    @CurrentUser() user: { id: string },
    @Param('attemptId') attemptId: string,
  ) {
    return this.examService.getAttempt(attemptId, user.id);
  }
}
