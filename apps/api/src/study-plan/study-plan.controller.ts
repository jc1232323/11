import { Body, Controller, ForbiddenException, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';
import { isPremium } from '../common/membership';
import { GeneratePlanDto } from './dto/generate-plan.dto';
import { StudyPlanService } from './study-plan.service';

@Controller('study-plan')
@UseGuards(JwtAuthGuard)
export class StudyPlanController {
  constructor(private readonly studyPlan: StudyPlanService) {}

  @Get()
  getPlan(@CurrentUser() user: User) {
    if (!isPremium(user)) {
      return { locked: true, message: '个性化学习计划为会员专属功能' };
    }
    return this.studyPlan.getPlan(user.id);
  }

  @Post('generate')
  generatePlan(@CurrentUser() user: User, @Body() body: GeneratePlanDto) {
    if (!isPremium(user)) {
      throw new ForbiddenException('个性化学习计划为会员专属功能，请升级会员');
    }
    return this.studyPlan.generatePlan(user.id, body);
  }
}
