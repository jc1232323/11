import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ROLE_IDS, type RoleId } from '../../common/role-prompts';

const PLAN_TYPES = ['free', 'monthly', 'quarterly', 'yearly'] as const;

export class CreateUserDto {
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email!: string;

  @IsString()
  @MinLength(8, { message: '密码至少 8 位' })
  password!: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsIn(ROLE_IDS)
  defaultRole?: RoleId;

  @IsOptional()
  @IsIn(PLAN_TYPES)
  plan?: (typeof PLAN_TYPES)[number];

  @IsOptional()
  @IsString()
  planExpiresAt?: string | null;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsIn(PLAN_TYPES)
  plan?: (typeof PLAN_TYPES)[number];

  @IsOptional()
  @IsString()
  planExpiresAt?: string | null;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(8, { message: '密码至少 8 位' })
  password?: string;
}
