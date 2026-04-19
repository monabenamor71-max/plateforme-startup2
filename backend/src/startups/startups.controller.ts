import { Controller, Get, Put, Post, Body, Request, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { StartupsService } from './startups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('startups')
export class StartupsController {
  constructor(private startupsService: StartupsService) {}

  @Get('liste')
  getListe() {
    return this.startupsService.getListe();
  }

  @Get('moi')
  @UseGuards(JwtAuthGuard)
  async getMoi(@Request() req: any) {
    console.log(`📡 /startups/moi appelé par user ID: ${req.user.id}`);
    const result = await this.startupsService.getMoi(req.user.id);
    console.log(`📤 Résultat renvoyé: ${JSON.stringify(result)}`);
    return result;
  }

  @Put('profil')
  @UseGuards(JwtAuthGuard)
  updateProfil(@Request() req: any, @Body() body: any) {
    console.log(`✏️ Mise à jour profil pour user ID: ${req.user.id}`);
    return this.startupsService.updateProfil(req.user.id, body);
  }

  @Post('photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: path.join(process.cwd(), 'uploads', 'photos'),
      filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
    }),
  }))
  uploadPhoto(@Request() req: any, @UploadedFile() file: any) {
    console.log(`📸 Upload photo pour user ID: ${req.user.id}, fichier: ${file.filename}`);
    return this.startupsService.updatePhoto(req.user.id, file.filename);
  }

  /**
   * Retourne la liste des experts triés :
   * - ceux recommandés (selon le secteur de la startup) en premier,
   * - puis tous les autres experts.
   * Route protégée par JWT.
   */
  @Get('experts-recommandes')
  @UseGuards(JwtAuthGuard)
  async getRecommendedExperts(@Request() req: any) {
    console.log(`🎯 /startups/experts-recommandes appelé par user ID: ${req.user.id}`);
    return this.startupsService.getRecommendedExperts(req.user.id);
  }
}