import { IsString, IsOptional, IsInt, Min, Max, IsPhoneNumber } from 'class-validator';

export class UpdateProfilDto {
  @IsString()
  @IsOptional()
  domaine?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  localisation?: string;

  @IsString()
  @IsOptional()
  experience?: string;

  @IsPhoneNumber()
  @IsOptional()
  telephone?: string;

  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear())
  @IsOptional()
  annee_debut_experience?: number;
}