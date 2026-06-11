import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @IsString()
  @MinLength(8, { message: '密码至少 8 位' })
  password!: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}
