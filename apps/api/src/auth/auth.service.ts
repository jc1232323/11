import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { MailService } from '../mail/mail.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
    private readonly mail: MailService,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('该邮箱已注册');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const emailVerifyToken = crypto.randomUUID();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = this.users.create({
      email: dto.email,
      passwordHash,
      nickname: dto.nickname?.trim() || dto.email.split('@')[0],
      defaultRole: 'guide',
      emailVerified: false,
      emailVerifyToken,
      emailVerifyExpires,
    });
    const saved = await this.users.save(user);

    // Send verification email (fire-and-forget, don't block registration)
    this.mail.sendVerificationEmail(dto.email, emailVerifyToken).catch(() => {});

    return saved;
  }

  async validateUser(dto: LoginDto): Promise<User> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('邮箱或密码错误');
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('邮箱或密码错误');
    return user;
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    if (!token) {
      throw new BadRequestException('验证链接无效');
    }
    const user = await this.users.findOne({ where: { emailVerifyToken: token } });
    if (!user) {
      throw new BadRequestException('验证链接无效或已过期');
    }
    if (user.emailVerifyExpires && user.emailVerifyExpires < new Date()) {
      throw new BadRequestException('验证链接已过期，请重新发送');
    }
    user.emailVerified = true;
    user.emailVerifyToken = null;
    user.emailVerifyExpires = null;
    await this.users.save(user);
    return { success: true, message: '邮箱验证成功' };
  }

  async resendVerification(userId: string): Promise<{ message: string }> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('用户不存在');
    if (user.emailVerified) {
      return { message: '邮箱已验证，无需重复操作' };
    }
    const token = crypto.randomUUID();
    user.emailVerifyToken = token;
    user.emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.users.save(user);
    await this.mail.sendVerificationEmail(user.email, token);
    return { message: '验证邮件已重新发送' };
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
    await this.mail.sendPasswordResetEmail(email, token);
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

  sanitizeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      defaultRole: user.defaultRole,
      emailVerified: user.emailVerified,
    };
  }
}
