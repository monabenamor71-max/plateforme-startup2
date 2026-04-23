import { IsInt, IsDateString, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateRendezVousDto {
  @IsInt()
  @IsNotEmpty()
  expert_id: number;

  @IsDateString()
  @IsNotEmpty()
  date_rdv: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  sujet: string;
}

export class UpdateRendezVousDto {
  @IsDateString()
  @IsNotEmpty()
  date_rdv: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  sujet: string;
}