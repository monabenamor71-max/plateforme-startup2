import { IsString, IsOptional, IsEmail, IsUrl } from 'class-validator';

export class UpdateConfigDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telephone?: string;

  @IsString()
  @IsOptional()
  adresse?: string;

  @IsUrl()
  @IsOptional()
  facebook?: string;

  @IsUrl()
  @IsOptional()
  linkedin?: string;

  @IsUrl()
  @IsOptional()
  instagram?: string;

  @IsUrl()
  @IsOptional()
  whatsapp?: string;

  @IsString()
  @IsOptional()
  horaires?: string;

  @IsString()
  @IsOptional()
  description_hero?: string;
}