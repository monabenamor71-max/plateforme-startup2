import { IsInt, IsPositive, IsOptional, IsString } from 'class-validator';

export class AssignerExpertDto {
  @IsInt()
  @IsPositive()
  expert_id: number;

  @IsString()
  @IsOptional()
  commentaire?: string;
}