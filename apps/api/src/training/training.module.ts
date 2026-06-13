import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingPack } from '../entities/training-pack.entity';
import { TrainingQuestion } from '../entities/training-question.entity';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingPack, TrainingQuestion])],
  controllers: [TrainingController],
  providers: [TrainingService],
  exports: [TrainingService],
})
export class TrainingModule {}
