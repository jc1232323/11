/** 将上游大模型返回的 JSON/文本转为用户可读的中文提示 */
export function formatLlmError(raw: string): string {
  const text = raw.trim();
  if (!text) return '大模型请求失败，请稍后重试';

  try {
    const parsed = JSON.parse(text) as {
      error?: { message?: string; type?: string };
      message?: string;
    };
    const msg = parsed.error?.message ?? parsed.message;
    if (msg) return mapKnownLlmMessage(msg);
  } catch {
    /* 非 JSON */
  }

  if (text.includes('{') && text.includes('error')) {
    const match = text.match(/"message"\s*:\s*"([^"]+)"/);
    if (match?.[1]) return mapKnownLlmMessage(match[1]);
  }

  return mapKnownLlmMessage(text.slice(0, 400));
}

function mapKnownLlmMessage(msg: string): string {
  const lower = msg.toLowerCase();
  if (
    lower.includes('insufficient balance') ||
    lower.includes('insufficient_quota') ||
    lower.includes('quota exceeded') ||
    lower.includes('credit balance') ||
    lower.includes('billing') ||
    msg.includes('余额不足') ||
    msg.includes('额度不足')
  ) {
    return 'AI 服务暂时不可用：平台大模型账户额度不足，请稍后重试或联系管理员处理。';
  }
  if (
    lower.includes('authentication') ||
    lower.includes('api key') ||
    lower.includes('invalid') ||
    msg.includes('无效')
  ) {
    return (
      '大模型 API Key 认证失败。请检查项目根目录 .env：\n' +
      '1. LLM_API_KEY 是否为该平台真实的 Key（勿使用 your-api-key-here 占位符）\n' +
      '2. LLM_API_BASE 是否与 Key 来源一致（DeepSeek Key → https://api.deepseek.com）\n' +
      '3. 修改 .env 后需重启 npm run dev'
    );
  }
  if (lower.includes('model') && (lower.includes('not') || lower.includes('exist'))) {
    return `模型名称有误：请检查 .env 中的 LLM_MODEL_NAME（当前配置可能不存在）。原始信息：${msg}`;
  }
  return msg;
}
