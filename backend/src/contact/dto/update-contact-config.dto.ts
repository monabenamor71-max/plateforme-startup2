import { IsOptional, IsString } from 'class-validator';

export class UpdateContactConfigDto {
  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  horaires?: string;

  @IsOptional()
  @IsString()
  description_hero?: string;
}