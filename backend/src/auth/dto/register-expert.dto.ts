import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional, MaxLength, Matches, IsInt, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterExpertDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty()
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @MinLength(6, { message: 'Mot de passe trop court (min 6 caractères)' })
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  prenom: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nom: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  @Matches(/^[\+]?[\d\s\-\(\)]{7,20}$/, { message: 'Téléphone invalide' })
  telephone?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  domaine: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  localisation?: string;

  @IsInt()
  @Min(1950)
  @Max(new Date().getFullYear())
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  annee_debut_experience?: number;
}