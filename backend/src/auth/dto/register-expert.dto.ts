import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterExpertDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  prenom: string;

  @IsNotEmpty()
  nom: string;

  @IsOptional()
  telephone?: string;

  @IsNotEmpty()
  domaine: string;

  // ✅ Suppression de @IsInt() et @Min/@Max
  @IsOptional()
  annee_debut_experience?: number;

  @IsOptional()
  localisation?: string;

  @IsOptional()
  description?: string;
}