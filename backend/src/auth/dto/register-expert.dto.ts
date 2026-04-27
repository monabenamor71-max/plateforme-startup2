import { IsEmail, IsNotEmpty, MinLength, IsOptional, IsInt, Min, Max, Matches, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

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
  @Matches(/^[+\d\s\-()]{8,20}$/, { message: 'Numéro de téléphone invalide (ex: +216 12 345 678)' })
  telephone?: string;

  @IsNotEmpty()
  domaine: string;

  @IsNotEmpty()
  @Transform(({ value }) => {
    // Convertit la chaîne en nombre, retourne NaN si non numérique
    const num = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(num)) {
      throw new Error('annee_debut_experience must be a valid number');
    }
    return num;
  })
  @IsInt({ message: 'annee_debut_experience must be an integer number' })
  @Min(1950, { message: 'annee_debut_experience must not be less than 1950' })
  @Max(new Date().getFullYear(), { message: `annee_debut_experience must not be greater than ${new Date().getFullYear()}` })
  annee_debut_experience: number;

  @IsNotEmpty()
  @IsString()
  localisation: string;

  @IsOptional()
  @IsString()
  description?: string;
}