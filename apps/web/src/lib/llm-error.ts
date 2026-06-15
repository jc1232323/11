/** 解析 SSE / API 返回的大模型错误为可读中文 */
export function formatLlmError(raw: string): string {
  const text = raw.trim();
  if (!text) return '大模型请求失败';

  try {
    const parsed = JSON.parse(text) as {
      error?: { message?: string };
      message?: string;
    };
    const msg = parsed.error?.message ?? parsed.message;
    if (msg) return mapMessage(msg);
  } catch {
    /* ignore */
  }

  return mapMessage(text.slice(0, 500));
}

function mapMessage(msg: string): string {
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
    msg.includes('your-api-key-here')
  ) {
    return (
      '大模型 API Key 认证失败。请在项目根目录 .env 填写正确的 LLM_API_KEY，' +
      '并确认 LLM_API_BASE 与 Key 来源一致（DeepSeek → https://api.deepseek.com），' +
      '修改后重启 npm run dev。'
    );
  }
  return msg;
}
