import { Controller, Get } from '@nestjs/common';
import { LlmService } from './llm.service';

/** 仅供本地排查：启动后访问 GET /api/llm/health */
@Controller('llm')
export class LlmController {
  constructor(private readonly llm: LlmService) {}

  @Get('health')
  async health() {
    return this.llm.testConnection();
  }
}
