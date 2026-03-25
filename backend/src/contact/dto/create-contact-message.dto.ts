import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

// Version sans class-validator
export class CreateContactMessageDto {
  nom: string;
  prenom: string;
  email: string;
  sujet: string;
  message: string;
}