import { config } from 'dotenv';
import { existsSync } from 'fs';
import * as nodemailer from 'nodemailer';
import { resolve } from 'path';

const PLACEHOLDER_MARKERS = ['your-email', 'your-smtp', 'changeme', 'example.com'];

function hasPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
}

async function main() {
  const envCandidates = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '../.env'),
  ];
  let loadedEnv: string | null = null;
  for (const path of envCandidates) {
    if (existsSync(path)) {
      config({ path, override: true });
      loadedEnv = path;
    }
  }

  const host = process.env.SMTP_HOST?.trim() || 'smtp.qq.com';
  const port = Number(process.env.SMTP_PORT || 465);
  const user = process.env.SMTP_USER?.trim() ?? '';
  const pass = process.env.SMTP_PASS?.trim() ?? '';
  const rawFrom = process.env.MAIL_FROM?.trim() ?? '';
  const recipient = process.argv[2]?.trim();

  if (!user || !pass || hasPlaceholder(`${user} ${pass}`)) {
    throw new Error(
      'SMTP 未配置完成。请先在 .env 中填写 SMTP_USER 和 SMTP_PASS；如果用 QQ 邮箱，SMTP_PASS 必须是授权码，不是 QQ 密码。',
    );
  }

  const from = rawFrom && !hasPlaceholder(rawFrom) ? rawFrom : user;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transporter.verify();
  console.log(`SMTP 连接验证成功: ${user} -> ${host}:${port}${loadedEnv ? ` (${loadedEnv})` : ''}`);

  if (!recipient) {
    console.log('未提供收件人邮箱，仅完成 SMTP 登录验证。');
    console.log('如需发送测试邮件：npm run mail:test -- your@email.com');
    return;
  }

  await transporter.sendMail({
    from,
    to: recipient,
    subject: 'SMTP 测试 - 化学知识问答',
    text: `这是一封 SMTP 测试邮件，发送时间：${new Date().toISOString()}`,
    html: `
      <div style="font-family: system-ui, sans-serif; padding: 24px; color: #1f2937;">
        <h2 style="margin: 0 0 12px;">SMTP 测试成功</h2>
        <p style="margin: 0 0 8px;">这是一封来自化学知识问答项目的测试邮件。</p>
        <p style="margin: 0; color: #6b7280;">发送时间：${new Date().toISOString()}</p>
      </div>
    `,
  });

  console.log(`测试邮件已发送到: ${recipient}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`SMTP 测试失败: ${message}`);
  process.exitCode = 1;
});
