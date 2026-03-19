import {
  Controller, Get, Post, Put,
  Param, Body, UseGuards, Req,
  UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ExpertsService } from './experts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('experts')
export class ExpertsController {
  constructor(private readonly expertsService: ExpertsService) {}

  // ── Public : liste experts validés ──
  @Get()
  findAll() {
    return this.expertsService.findAll();
  }

  // ── Routes statiques AVANT :id ──

  @Get('moi')
  @UseGuards(JwtAuthGuard)
  getMoi(@Req() req) {
    return this.expertsService.getMoi(req.user.id);
  }

  @Put('profil')
  @UseGuards(JwtAuthGuard)
  updateProfil(@Req() req, @Body() body: any) {
    return this.expertsService.updateProfil(req.user.id, body);
  }

  @Post('temoignage')
  @UseGuards(JwtAuthGuard)
  envoyerTemoignage(@Req() req, @Body() body: { texte: string }) {
    return this.expertsService.envoyerTemoignage(req.user.id, body.texte);
  }

  @Post('photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads/photos',
      filename: (req, file, cb) =>
        cb(null, `${Date.now()}${extname(file.originalname)}`),
    }),
  }))
  uploadPhoto(@Req() req, @UploadedFile() file: Express.Multer.File) {
    if (!file) return { error: 'Aucun fichier recu' };
    return this.expertsService.updateProfil(req.user.id, { photo: file.filename });
  }

  // ── Profil public — TOUJOURS EN DERNIER ──
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expertsService.findOne(+id);
  }
}