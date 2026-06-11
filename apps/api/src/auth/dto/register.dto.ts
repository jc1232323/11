import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @IsString()
  @MinLength(8, { message: '密码至少 8 位' })
  password!: string;

  @IsString({ message: '请输入验证码' })
  @Length(6, 6, { message: '验证码为 6 位数字' })
  code!: string;

  @IsOptional()
  @IsString()
  nickname?: string;
}
