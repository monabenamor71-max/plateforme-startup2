// src/auth/auth.controller.ts
import { Controller, Post, Body, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/expert')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'cv', maxCount: 1 },
    { name: 'photo', maxCount: 1 },
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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (file.fieldname === 'photo') {
        const allowedImageExt = /\.(jpg|jpeg|png|gif|webp)$/i;
        if (!allowedImageExt.test(file.originalname)) {
          return cb(new BadRequestException('La photo doit être au format JPG, JPEG, PNG, GIF ou WEBP'), false);
        }
      } 
      else if (file.fieldname === 'cv') {
        const allowedCvExt = /\.(pdf|doc|docx)$/i;
        if (!allowedCvExt.test(file.originalname)) {
          return cb(new BadRequestException('Le CV doit être au format PDF, DOC ou DOCX'), false);
        }
      }
      else if (file.fieldname === 'portfolio') {
        const allowedPortfolioExt = /\.(pdf|doc|docx|ppt|pptx|zip)$/i;
        if (!allowedPortfolioExt.test(file.originalname)) {
          return cb(new BadRequestException('Le portfolio doit être au format PDF, DOC, DOCX, PPT, PPTX ou ZIP'), false);
        }
      }
      cb(null, true);
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  async registerExpert(
    @Body() body: any,
    @UploadedFiles() files: { cv?: Express.Multer.File[]; photo?: Express.Multer.File[]; portfolio?: Express.Multer.File[] },
  ) {
    if (!files.photo || files.photo.length === 0) throw new BadRequestException('La photo est requise');
    if (!files.cv || files.cv.length === 0) throw new BadRequestException('Le CV est requis');

    const cvFile = files.cv[0];
    const photoFile = files.photo[0];
    const portfolioFile = files.portfolio?.[0];
    return this.authService.registerExpert(body, { cv: cvFile, photo: photoFile, portfolio: portfolioFile });
  }

  @Post('register/startup')
  registerStartup(@Body() body: any) {
    return this.authService.registerStartup(body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
}