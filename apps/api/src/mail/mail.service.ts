import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST') || 'smtp.qq.com',
      port: Number(this.config.get<string>('SMTP_PORT') || 465),
      secure: true,
      auth: {
        user: this.config.get<string>('SMTP_USER'),
        pass: this.config.get<string>('SMTP_PASS'),
      },
    });
  }

  private get from(): string {
    return this.config.get<string>('MAIL_FROM') || this.config.get<string>('SMTP_USER') || '';
  }

  private get clientUrl(): string {
    return (this.config.get<string>('CLIENT_URL') || 'http://localhost:5173').replace(/\/$/, '');
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
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
    try {
      await this.transporter.sendMail({
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
