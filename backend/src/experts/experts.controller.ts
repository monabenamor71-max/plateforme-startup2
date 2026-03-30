import { Controller, Get, Put, Patch, Post, Body, Param, Request, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ExpertsService } from './experts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Controller('experts')
export class ExpertsController {
  constructor(private expertsService: ExpertsService) {}

  @Get()
  getAll() {
    return this.expertsService.getListe();
  }

  @Get('moi')
  @UseGuards(JwtAuthGuard)
  getMoi(@Request() req: any) {
    return this.expertsService.getMoi(req.user.id);
  }

  @Get('liste')
  getListe() {
    return this.expertsService.getListe();
  }

  @Put('profil')
  @UseGuards(JwtAuthGuard)
  updateProfil(@Request() req: any, @Body() body: any) {
    return this.expertsService.updateProfil(req.user.id, body);
  }

  @Post('photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: path.join(process.cwd(), 'uploads', 'photos'),
      filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
      },
    }),
  }))
  uploadPhoto(@Request() req: any, @UploadedFile() file: any) {
    if (!file) return { message: 'Aucun fichier recu' };
    return this.expertsService.updatePhoto(req.user.id, file.filename);
  }

  @Patch(':id/valider-modification')
  validerModification(@Param('id') id: number) {
    return this.expertsService.validerModification(id);
  }

  @Patch(':id/refuser-modification')
  refuserModification(@Param('id') id: number) {
    return this.expertsService.refuserModification(id);
  }
}