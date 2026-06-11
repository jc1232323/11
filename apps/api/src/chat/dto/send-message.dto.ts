import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ROLE_IDS, type RoleId } from '../../common/role-prompts';

export class SendMessageDto {
  /** 发给大模型的完整内容（无 knowledgeSlug 时直接使用） */
  @IsString()
  @MinLength(1, { message: '请输入消息内容' })
  content!: string;

  /** 聊天界面展示用（如知识点「问 AI」的简短气泡） */
  @IsOptional()
  @IsString()
  displayContent?: string;

  @IsOptional()
  @IsIn(ROLE_IDS)
  roleMode?: RoleId;

  @IsOptional()
  @IsString()
  knowledgeSlug?: string;

  @IsOptional()
  @IsIn(['explain', 'practice', 'free'])
  askMode?: 'explain' | 'practice' | 'free';
}
