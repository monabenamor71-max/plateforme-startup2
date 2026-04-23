import { Controller, Post, Body, Get, Query, UseInterceptors, UploadedFiles, BadRequestException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterExpertDto } from './dto/register-expert.dto';
import { RegisterStartupDto } from './dto/register-startup.dto';
import { LoginDto } from './dto/login.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/expert')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'photo', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
    { name: 'portfolio', maxCount: 1 },
  ], {
    storage: diskStorage({
      destination: (req, file, cb) => {
        let folder = './uploads';
        if (file.fieldname === 'photo') folder = './uploads/photos';
        else if (file.fieldname === 'cv') folder = './uploads/cv';
        else if (file.fieldname === 'portfolio') folder = './uploads/portfolio';
        cb(null, folder);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
      },
    }),
  }))
  async registerExpert(
    @Req() req: Request,
    @UploadedFiles() files: { photo?: Express.Multer.File[]; cv?: Express.Multer.File[]; portfolio?: Express.Multer.File[] },
  ) {
    const body = req.body;
    if (!body.email) throw new BadRequestException('Email requis');
    if (!body.password) throw new BadRequestException('Mot de passe requis');
    if (body.password.length < 6) throw new BadRequestException('Mot de passe trop court');
    if (!body.prenom) throw new BadRequestException('Prénom requis');
    if (!body.nom) throw new BadRequestException('Nom requis');
    if (!body.domaine) throw new BadRequestException('Domaine requis');

    const dto = new RegisterExpertDto();
    dto.email = body.email;
    dto.password = body.password;
    dto.prenom = body.prenom;
    dto.nom = body.nom;
    dto.telephone = body.telephone;
    dto.domaine = body.domaine;
    dto.annee_debut_experience = body.annee_debut_experience ? parseInt(body.annee_debut_experience, 10) : undefined;
    dto.localisation = body.localisation;
    dto.description = body.description;

    const photoPath = files.photo?.[0]?.path;
    const cvPath = files.cv?.[0]?.path;
    const portfolioPath = files.portfolio?.[0]?.path;

    return this.authService.registerExpert(dto, photoPath, cvPath, portfolioPath);
  }

  @Post('register/startup')
  async registerStartup(@Body() body: RegisterStartupDto) {
    return this.authService.registerStartup(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    if (!email) throw new Error('Email requis');
    return this.authService.forgotPassword(email);
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body() body: any) {
    const { email, code, newPassword } = body;
    return this.authService.resetPasswordWithCode(email, code, newPassword);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    const { token, newPassword } = body;
    return this.authService.resetPassword(token, newPassword);
  }

  @Get('confirm')
  async confirmEmail(@Query('token') token: string) {
    return this.authService.confirmEmail(token);
  }
}