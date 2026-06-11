import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ROLE_IDS, type RoleId } from '../../common/role-prompts';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  nickname?: string;

  @IsOptional()
  @IsIn(ROLE_IDS)
  defaultRole?: RoleId;
}
