import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/** In-memory store for email verification codes (email -> { code, expiresAt }) */
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

/** Clean expired codes periodically */
setInterval(() => {
  const now = Date.now();
  for (const [email, entry] of verificationCodes) {
    if (entry.expiresAt < now) verificationCodes.delete(email);
  }
}, 60_000);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  /** Send a 6-digit verification code to the email (pre-registration) */
  async sendVerificationCode(email: string): Promise<{ message: string }> {
    // Check if already registered
    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('该邮箱已注册');
    }

    // Rate limit: don't send again if code was sent less than 60s ago
    const prev = verificationCodes.get(email);
    if (prev && prev.expiresAt - 4 * 60 * 1000 > Date.now()) {
      throw new BadRequestException('验证码已发送，请 60 秒后再试');
    }

    const code = String(Math.floor(100000 + Math.random() * 900000)); // 6 digits

    await this.mail.sendVerificationCode(email, code);
    verificationCodes.set(email, { code, expiresAt: Date.now() + 5 * 60 * 1000 }); // 5min
    return { message: '验证码已发送' };
  }

  async register(dto: RegisterDto): Promise<User> {
    // Verify the code first
    const entry = verificationCodes.get(dto.email);
    if (!entry) {
      throw new BadRequestException('请先获取验证码');
    }
    if (entry.expiresAt < Date.now()) {
      verificationCodes.delete(dto.email);
      throw new BadRequestException('验证码已过期，请重新获取');
    }
    if (entry.code !== dto.code) {
      throw new BadRequestException('验证码错误');
    }

    // Code is valid — remove it
    verificationCodes.delete(dto.email);

    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('该邮箱已注册');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.users.create({
      email: dto.email,
      passwordHash,
      nickname: dto.nickname?.trim() || dto.email.split('@')[0],
      defaultRole: 'guide',
      emailVerified: true, // verified during registration via code
    });
    return this.users.save(user);
  }

  async validateUser(dto: LoginDto): Promise<User> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('邮箱或密码错误');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('邮箱或密码错误');
    return user;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.users.findOne({ where: { email } });
    // Always return success to avoid email enumeration
    if (!user) {
      return { message: '如果该邮箱已注册，重置链接将发送到你的邮箱' };
    }
    const token = crypto.randomUUID();
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await this.users.save(user);
    try {
      await this.mail.sendPasswordResetEmail(email, token);
    } catch (error) {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await this.users.save(user);
      throw error;
    }
    return { message: '如果该邮箱已注册，重置链接将发送到你的邮箱' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token) {
      throw new BadRequestException('重置链接无效');
    }
    const user = await this.users.findOne({ where: { resetPasswordToken: token } });
    if (!user) {
      throw new BadRequestException('重置链接无效或已过期');
    }
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('重置链接已过期，请重新申请');
    }
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await this.users.save(user);
    return { message: '密码重置成功，请使用新密码登录' };
  }

  signToken(user: User): string {
    return this.jwt.sign({ sub: user.id, email: user.email });
  }

  async getUserFromToken(token?: string | null): Promise<User | null> {
    if (!token) return null;

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token);
      if (!payload?.sub) return null;
      return await this.users.findOne({ where: { id: payload.sub } });
    } catch {
      return null;
    }
  }

  sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      defaultRole: user.defaultRole,
      emailVerified: user.emailVerified,
      plan: user.plan,
      planExpiresAt: user.planExpiresAt?.toISOString() ?? null,
    };
  }
}
