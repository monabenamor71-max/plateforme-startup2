import {
  Controller, Post, Body,
  UseInterceptors, UploadedFile,
  BadRequestException, InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { UserRole } from '../users/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── LOGIN ──────────────────────────────────────────────
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  // ── REGISTER STARTUP ───────────────────────────────────
  @Post('register/startup')
  async registerStartup(@Body() body: any) {
    const userData = {
      email:     body.email,
      password:  body.password,
      nom:       body.nom,
      prenom:    body.prenom,
      telephone: body.telephone,
    };

    const profileData = {
      nom_startup: body.nom_startup || '',
      secteur:     body.secteur    || '',
      taille:      body.taille     || '',
      fonction:    body.fonction   || '',
    };

    return this.authService.register(userData, UserRole.STARTUP, profileData);
  }

  // ── REGISTER EXPERT ────────────────────────────────────
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
        return cb(
          new BadRequestException('Seuls les fichiers PDF ou Word sont autorisés'),
          false,
        );
      }
      cb(null, true);
    },
  }))
  async registerExpert(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      const userData = {
        email:     body.email,
        password:  body.password,
        nom:       body.nom,
        prenom:    body.prenom,
        telephone: body.telephone,
      };

      const profileData = {
        domaine:      body.domaine      || '',
        experience:   body.experience   || '',
        localisation: body.localisation || '',
        tarif:        body.tarif        || '',
        description:  body.description  || '',
        cvPath:       file ? file.filename : null,
      };

      return await this.authService.register(userData, UserRole.EXPERT, profileData);
    } catch (error) {
      console.error('Erreur inscription expert:', error);
      throw new InternalServerErrorException("Erreur lors de l'inscription");
    }
  }
}