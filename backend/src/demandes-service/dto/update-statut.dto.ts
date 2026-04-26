import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStatutDto {
  @IsEnum(['en_attente', 'acceptee', 'refusee', 'en_cours', 'terminee'])
  statut: string;

  @IsString()
  @IsOptional()
  commentaire?: string;
}