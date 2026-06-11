import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatLlmError } from '../common/llm-error';

export type LlmConfig = {
  apiBase: string;
  apiKey: string;
  modelName: string;
};

const PLACEHOLDER_MARKERS = ['your-api-key-here', 'your-api-key', 'sk-xxx', 'changeme'];

@Injectable()
export class LlmService implements OnModuleInit {
  private readonly logger = new Logger(LlmService.name);

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    try {
      const cfg = this.getConfig();
      const masked = `${cfg.apiKey.slice(0, 6)}…${cfg.apiKey.slice(-4)}`;
      this.logger.log(
        `大模型已加载：${cfg.apiBase} | 模型=${cfg.modelName} | Key=${masked}`,
      );
    } catch (e) {
      this.logger.error(
        e instanceof Error ? e.message : '大模型配置无效，AI 问答将不可用',
      );
    }
  }

  getConfig(): LlmConfig {
    const apiKey = this.config.get<string>('LLM_API_KEY')?.trim();
    const modelName = this.config.get<string>('LLM_MODEL_NAME')?.trim();

    if (!apiKey || !modelName) {
      throw new BadRequestException(
        '平台大模型尚未配置：请在项目根目录 .env 设置 LLM_API_KEY 与 LLM_MODEL_NAME',
      );
    }

    const lowerKey = apiKey.toLowerCase();
    if (PLACEHOLDER_MARKERS.some((m) => lowerKey.includes(m))) {
      throw new BadRequestException(
        'LLM_API_KEY 仍为示例占位符，请填入 DeepSeek 等平台申请的真实 Key，并重启服务',
      );
    }

    if (apiKey.length < 20) {
      throw new BadRequestException('LLM_API_KEY 长度异常，请检查是否复制完整');
    }

    const apiBase = (
      this.config.get<string>('LLM_API_BASE')?.trim() ||
      'https://api.deepseek.com'
    ).replace(/\/$/, '');

    return { apiBase, apiKey, modelName };
  }

  /** 启动时或管理端可调用：探测 Key 是否有效 */
  async testConnection(): Promise<{ ok: boolean; message: string }> {
    const cfg = this.getConfig();
    const url = `${cfg.apiBase}/v1/chat/completions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.modelName,
        max_tokens: 5,
        messages: [{ role: 'user', content: 'hi' }],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (res.ok) {
      return { ok: true, message: '大模型连接正常' };
    }

    const text = await res.text().catch(() => '');
    return {
      ok: false,
      message: `HTTP ${res.status}：${formatLlmError(text)}`,
    };
  }
}
