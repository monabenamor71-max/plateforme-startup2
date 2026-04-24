import { IsString, IsOptional, IsInt } from 'class-validator';

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

  @IsString()
  @IsOptional()
  telephone?: string;

  // ✅ Plus aucune contrainte de plage
  @IsOptional()
  @IsInt()
  annee_debut_experience?: number;
}