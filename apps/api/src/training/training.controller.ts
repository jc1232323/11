import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainingService } from './training.service';

@Controller('training')
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(private readonly training: TrainingService) {}

  @Get('packs')
  listPacks() {
    return this.training.listPacks();
  }

  @Get('packs/:packId')
  async getPack(@Param('packId') packId: string) {
    const pack = await this.training.getPackWithQuestions(packId);
    if (!pack) throw new NotFoundException('题包不存在');
    return pack;
  }
}
