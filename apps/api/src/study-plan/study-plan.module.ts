import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudyPlan } from '../entities/study-plan.entity';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { StudyPlanController } from './study-plan.controller';
import { StudyPlanService } from './study-plan.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudyPlan]), KnowledgeModule],
  controllers: [StudyPlanController],
  providers: [StudyPlanService],
})
export class StudyPlanModule {}
