import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { KnowledgeService } from './knowledge.service';

@Controller('knowledge')
@UseGuards(JwtAuthGuard)
export class KnowledgeController {
  constructor(private readonly knowledge: KnowledgeService) {}

  @Get('tree')
  tree() {
    return this.knowledge.getTree();
  }

  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.knowledge.getBySlug(slug);
  }
}
