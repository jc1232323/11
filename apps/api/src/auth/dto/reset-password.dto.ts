import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @MinLength(8, { message: '密码至少 8 位' })
  password!: string;
}
