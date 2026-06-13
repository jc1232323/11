import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { StudyPlanService } from './study-plan.service';

@Controller('study-plan')
@UseGuards(JwtAuthGuard)
export class StudyPlanController {
  constructor(private readonly studyPlan: StudyPlanService) {}

  @Get()
  getPlan(@CurrentUser() user: User) {
    return this.studyPlan.getPlan(user.id);
  }

  @Post('generate')
  generatePlan(@CurrentUser() user: User, @Body() body: GeneratePlanDto) {
    return this.studyPlan.generatePlan(user.id, body);
  }
}
