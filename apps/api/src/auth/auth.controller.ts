import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  private setCookie(res: Response, token: string) {
    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
  }

  /** Send a 6-digit verification code to the email before registration */
  @Post('send-code')
  async sendCode(@Body() dto: ForgotPasswordDto /* reuses { email } */) {
    return this.auth.sendVerificationCode(dto.email);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.auth.register(dto);
    const token = this.auth.signToken(user);
    this.setCookie(res, token);
    return { user: this.auth.sanitizeUser(user) };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.auth.validateUser(dto);
    const token = this.auth.signToken(user);
    this.setCookie(res, token);
    return { user: this.auth.sanitizeUser(user) };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    return { ok: true };
  }

  @Get('me')
  async me(@Req() req: Request) {
    const user = await this.auth.getUserFromToken(req.cookies?.access_token);
    return { user: user ? this.auth.sanitizeUser(user) : null };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto.token, dto.password);
  }
}
