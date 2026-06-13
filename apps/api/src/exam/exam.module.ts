import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exam } from '../entities/exam.entity';
import { ExamAttempt } from '../entities/exam-attempt.entity';
import { TrainingQuestion } from '../entities/training-question.entity';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, ExamAttempt, TrainingQuestion])],
  controllers: [ExamController],
  providers: [ExamService],
  exports: [ExamService],
})
export class ExamModule {}
