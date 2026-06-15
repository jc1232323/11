import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

const PLACEHOLDER_MARKERS = ['your-email', 'your-smtp', 'changeme', 'example.com'];

function hasPlaceholder(value: string): boolean {
  const lower = value.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private readonly configured: boolean;
  private readonly fromAddress: string;

  constructor(private readonly config: ConfigService) {
    const user = this.config.get<string>('SMTP_USER')?.trim() ?? '';
    const pass = this.config.get<string>('SMTP_PASS')?.trim() ?? '';
    const rawFrom = this.config.get<string>('MAIL_FROM')?.trim() ?? '';
    const port = Number(this.config.get<string>('SMTP_PORT') || 465);

    this.fromAddress = rawFrom && !hasPlaceholder(rawFrom) ? rawFrom : user;
    this.configured = Boolean(user && pass) && !hasPlaceholder(`${user} ${pass}`);

    if (this.configured) {
      this.transporter = nodemailer.createTransport({
        host: this.config.get<string>('SMTP_HOST') || 'smtp.qq.com',
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`邮件服务已配置：${user}`);
      if (rawFrom && rawFrom !== this.fromAddress) {
        this.logger.warn('MAIL_FROM 仍为占位符，已自动回退为 SMTP_USER 作为发件人。');
      }
    } else {
      this.logger.warn(
        '邮件服务未配置（SMTP_USER/SMTP_PASS 为空或为占位符）。验证码和重置邮件将直接报错，不会伪装成发送成功。',
      );
    }
  }

  /** True when real SMTP credentials are present */
  get isConfigured(): boolean {
    return this.configured;
  }

  private get from(): string {
    return this.fromAddress;
  }

  private get clientUrl(): string {
    return (this.config.get<string>('CLIENT_URL') || 'http://localhost:5173').replace(/\/$/, '');
  }

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      throw new ServiceUnavailableException(
        '邮件服务未配置。请在 .env 中填写 SMTP_USER 和 SMTP_PASS；如果使用 QQ 邮箱，SMTP_PASS 必须填写 QQ 邮箱授权码，而不是 QQ 密码。',
      );
    }
    return this.transporter;
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const transporter = this.getTransporter();
    try {
      await transporter.sendMail({
        from: this.from,
        to,
        subject: '注册验证码 - 化学知识问答',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
            <h2 style="color: #1d1d1f;">邮箱验证码</h2>
            <p style="color: #555; line-height: 1.6;">
              你正在注册化学知识问答平台，验证码为：
            </p>
            <div style="margin: 1.5rem 0; padding: 1rem 1.5rem; background: #f5f5f7; border-radius: 8px; text-align: center;">
              <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #4F6EF7;">${code}</span>
            </div>
            <p style="color: #888; font-size: 0.85rem;">验证码 5 分钟内有效。如果你没有进行注册操作，请忽略此邮件。</p>
          </div>
        `,
      });
      this.logger.log(`验证码已发送至 ${to}`);
    } catch (e) {
      this.logger.error(`发送验证码失败: ${e instanceof Error ? e.message : e}`);
      throw e;
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const link = `${this.clientUrl}/reset-password?token=${token}`;
    const transporter = this.getTransporter();
    try {
      await transporter.sendMail({
        from: this.from,
        to,
        subject: '重置密码 - 化学知识问答',
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 2rem;">
            <h2 style="color: #1d1d1f;">重置你的密码</h2>
            <p style="color: #555; line-height: 1.6;">
              我们收到了你的密码重置请求。请点击下方按钮设置新密码：
            </p>
            <a href="${link}"
               style="display: inline-block; margin: 1.5rem 0; padding: 0.75rem 1.5rem; background: #4F6EF7; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">
              重置密码
            </a>
            <p style="color: #888; font-size: 0.85rem;">
              如果按钮无法点击，请复制以下链接到浏览器：<br/>
              <a href="${link}" style="color: #4F6EF7;">${link}</a>
            </p>
            <p style="color: #888; font-size: 0.85rem;">此链接 1 小时内有效。如果你没有请求重置密码，请忽略此邮件。</p>
          </div>
        `,
      });
      this.logger.log(`密码重置邮件已发送至 ${to}`);
    } catch (e) {
      this.logger.error(`发送重置邮件失败: ${e instanceof Error ? e.message : e}`);
      throw e;
    }
  }
}
