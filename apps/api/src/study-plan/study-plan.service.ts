import {
  BadGatewayException,
  BadRequestException,
  GatewayTimeoutException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { formatLlmError } from '../common/llm-error';
import { StudyPlan } from '../entities/study-plan.entity';
import { LlmService } from '../llm/llm.service';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { GeneratePlanDto } from './dto/generate-plan.dto';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;
const REQUEST_TIMEOUT_MS = 120000;
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class StudyPlanService {
  constructor(
    @InjectRepository(StudyPlan) private readonly plans: Repository<StudyPlan>,
    private readonly llm: LlmService,
    private readonly knowledge: KnowledgeService,
  ) {}

  async getPlan(userId: string) {
    return this.plans.findOne({ where: { userId }, order: { updatedAt: 'DESC' } });
  }

  async generatePlan(userId: string, input: GeneratePlanDto) {
    // Get knowledge tree to give AI context about available topics
    const tree = await this.knowledge.getTree();
    const topicList = tree
      .flatMap((mod) =>
        mod.chapters.flatMap((ch) =>
          ch.topics.map((t) => `${mod.title} > ${ch.title} > ${t.title}`),
        ),
      )
      .join('\n');

    const prompt = this.buildPrompt(input, topicList);
    const planJson = await this.callLlm(prompt);

    // Upsert: update existing or create new
    let plan = await this.plans.findOne({ where: { userId } });
    if (plan) {
      plan.targetScore = input.targetScore;
      plan.grade = input.grade;
      plan.targetSchool = input.targetSchool;
      plan.weakPoints = input.weakPoints ?? null;
      plan.planContent = planJson;
    } else {
      plan = this.plans.create({
        userId,
        targetScore: input.targetScore,
        grade: input.grade,
        targetSchool: input.targetSchool,
        weakPoints: input.weakPoints ?? null,
        planContent: planJson,
      });
    }
    return this.plans.save(plan);
  }

  private buildPrompt(input: GeneratePlanDto, topicList: string): string {
    return `你是一位资深高中化学教师，需要为学生制定一份 30 天的个性化学习计划。

## 学生信息
- 年级：${input.grade}
- 目标分数：${input.targetScore} 分（满分 100）
- 目标学校：${input.targetSchool}
- 薄弱环节：${input.weakPoints || '未填写'}

## 可用的知识点列表
${topicList}

## 要求
请输出一个 JSON 数组，包含 30 天的学习计划。每天的格式如下：
{
  "day": 1,
  "date": "第1天",
  "topics": ["知识点名称1", "知识点名称2"],
  "practice": "今天的练习安排（如：选择题10道 + 填空题3道）",
  "duration": "预计学习时长（如：1.5小时）",
  "focus": "今天重点说明（一句话）"
}

规则：
1. 前期侧重基础知识点，后期加入综合训练和模拟题
2. 薄弱环节要多次重复训练
3. 每周安排一天复习回顾
4. 练习量从少到多，循序渐进
5. 考虑学生年级，高三需要更高强度
6. 只输出纯 JSON 数组，不要任何其他文字`;
  }

  private async callLlm(prompt: string): Promise<string> {
    const config = this.llm.getConfig();
    const payload = {
      model: config.modelName,
      messages: [
        {
          role: 'system',
          content:
            '你是一个 JSON 生成器，只输出合法的 JSON 数组，不要输出任何 markdown 标记或额外文字。',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    };

    let response: globalThis.Response | null = null;
    let lastError = '';

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const current = await fetch(`${config.apiBase}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (current.ok) {
          response = current;
          break;
        }

        const text = await current.text().catch(() => '');
        const friendly = formatLlmError(text);

        if (RETRYABLE_STATUS.has(current.status) && attempt < MAX_RETRIES) {
          lastError = friendly;
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }

        throw new BadGatewayException(`AI 生成失败：${friendly}`);
      } catch (error) {
        if (error instanceof BadGatewayException) {
          throw error;
        }

        const message = error instanceof Error ? error.message : '网络请求失败';
        const isTimeout =
          error instanceof DOMException ||
          message.toLowerCase().includes('timeout') ||
          message.toLowerCase().includes('aborted');

        if (attempt < MAX_RETRIES) {
          lastError = isTimeout ? 'AI 响应超时' : message;
          await sleep(RETRY_DELAY_MS * (attempt + 1));
          continue;
        }

        if (isTimeout) {
          throw new GatewayTimeoutException('AI 响应超时，请稍后重试');
        }

        throw new ServiceUnavailableException(
          `连接 AI 服务失败：${formatLlmError(lastError || message)}`,
        );
      }
    }

    if (!response) {
      throw new ServiceUnavailableException(
        `AI 服务暂时不可用，请稍后重试${lastError ? `：${lastError}` : ''}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    let content = data.choices?.[0]?.message?.content?.trim() ?? '';

    // Strip markdown code fences if present
    if (content.startsWith('```')) {
      content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    }

    // Validate it's valid JSON array
    try {
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) throw new Error('not array');
      return JSON.stringify(parsed);
    } catch {
      throw new BadRequestException('AI 返回的计划格式异常，请重试');
    }
  }
}
