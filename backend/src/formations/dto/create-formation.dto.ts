import { IsString, IsOptional, IsBoolean, IsInt, Min, IsDateString, IsEnum, IsUrl } from 'class-validator';

export class CreateFormationDto {
  @IsString()
  titre: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  domaine?: string;

  @IsString()
  @IsOptional()
  formateur?: string;

  @IsEnum(['gratuit', 'payant'])
  @IsOptional()
  type?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  prix?: number;

  @IsBoolean()
  @IsOptional()
  places_limitees?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  places_disponibles?: number;

  @IsString()
  @IsOptional()
  duree?: string;

  @IsEnum(['en_ligne', 'presentiel'])
  @IsOptional()
  mode?: string;

  @IsString()
  @IsOptional()
  localisation?: string;

  @IsBoolean()
  @IsOptional()
  certifiante?: boolean;

  @IsBoolean()
  @IsOptional()
  a_la_une?: boolean;

  @IsDateString()
  @IsOptional()
  dateDebut?: string;

  @IsDateString()
  @IsOptional()
  dateFin?: string;

  @IsUrl()
  @IsOptional()
  lien_formation?: string;

  @IsBoolean()
  @IsOptional()
  gratuit?: boolean;

  @IsString()
  @IsOptional()
  niveau?: string;

  @IsString()
  @IsOptional()
  categorie?: string;

  @IsEnum(['brouillon', 'publie', 'archive', 'en_attente'])
  @IsOptional()
  statut?: string;
}