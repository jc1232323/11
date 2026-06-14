import { Controller, ForbiddenException, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../entities/user.entity';
import { isPremium, FREE_LIMITS } from '../common/membership';
import { TrainingService } from './training.service';

/** In-memory daily training access tracker: Map<"userId:date", count> */
const dailyTrainingAccess = new Map<string, number>();

// Cleanup old entries every hour
setInterval(() => {
  const today = new Date().toISOString().split('T')[0];
  for (const key of dailyTrainingAccess.keys()) {
    if (!key.endsWith(today)) dailyTrainingAccess.delete(key);
  }
}, 3600_000);

@Controller('training')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(private readonly training: TrainingService) {}

  @Get('packs')
  listPacks() {
    return this.training.listPacks();
  }

  @Get('packs/:packId')
  async getPack(@CurrentUser() user: User, @Param('packId') packId: string) {
    // Free user: 1 pack per day
    if (!isPremium(user)) {
      const today = new Date().toISOString().split('T')[0];
      const key = `${user.id}:${today}`;
      const count = dailyTrainingAccess.get(key) ?? 0;
      if (count >= FREE_LIMITS.dailyTrainingPacks) {
        throw new ForbiddenException(
          `今日免费训练次数已用完（${FREE_LIMITS.dailyTrainingPacks}次/天）。升级会员可无限训练。`,
        );
      }
      dailyTrainingAccess.set(key, count + 1);
    }

    const pack = await this.training.getPackWithQuestions(packId);
    if (!pack) throw new NotFoundException('题包不存在');
    return pack;
  }
}
