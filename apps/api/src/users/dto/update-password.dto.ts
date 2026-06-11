import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(1, { message: '请输入旧密码' })
  oldPassword!: string;

  @IsString()
  @MinLength(8, { message: '新密码至少 8 位' })
  newPassword!: string;
}
