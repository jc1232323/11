import { IsIn, IsOptional, IsString } from 'class-validator';
import { ROLE_IDS, type RoleId } from '../../common/role-prompts';

export class UpdateSessionDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsIn(ROLE_IDS)
  roleMode?: RoleId;
}
