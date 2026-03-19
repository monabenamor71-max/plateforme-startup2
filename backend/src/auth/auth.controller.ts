import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { UserRole } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register/startup')
  async registerStartup(@Body() body: any) {
    const userData = {
      email: body.email,
      password: body.password,
      nom: body.nom,
      prenom: body.prenom,
      telephone: body.telephone,
    };
    const profileData = {
      secteur: body.secteur,
      taille: body.taille,
    };
    return this.authService.register(userData, UserRole.STARTUP, profileData);
  }

 @Post('register/expert')
@UseInterceptors(FileInterceptor('cv', {
  storage: diskStorage({
    destination: './uploads/cvs',
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, unique + extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(pdf|doc|docx)$/)) {
      return cb(new BadRequestException('Seuls les fichiers PDF ou Word sont autorisés'), false);
    }
    cb(null, true);
  },
}))
async registerExpert(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
  try {
    const userData = {
      email: body.email,
      password: body.password,
      nom: body.nom,
      prenom: body.prenom,
      telephone: body.telephone,
    };
    const description = `Expérience: ${body.experience || ''} - Localisation: ${body.localisation || ''}`;
    const profileData = {
      domaine: body.domaine,
      description: description,
      localisation: body.localisation,
      cvPath: file ? file.filename : null,
    };
    return await this.authService.register(userData, UserRole.EXPERT, profileData);
  } catch (error) {
    console.error('Erreur:', error);
    throw new InternalServerErrorException('Erreur lors de l\'inscription');
  }
}}