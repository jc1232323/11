import { IsIn, IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';

export class GeneratePlanDto {
  @IsInt({ message: '目标分数必须是整数' })
  @Min(30, { message: '目标分数不能低于 30 分' })
  @Max(100, { message: '目标分数不能高于 100 分' })
  targetScore!: number;

  @IsString()
  @IsIn(['高一', '高二', '高三'], { message: '年级必须是高一、高二或高三' })
  grade!: string;

  @IsString()
  @MinLength(2, { message: '请填写目标学校' })
  @MaxLength(128, { message: '目标学校不能超过 128 个字符' })
  targetSchool!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: '薄弱环节内容过长，请精简后重试' })
  weakPoints?: string;
}
