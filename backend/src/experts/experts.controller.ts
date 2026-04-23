// src/experts/experts.controller.ts
import {
  Controller, Get, Put, Patch, Post, Body, Param, Request,
  UseGuards, UseInterceptors, UploadedFile, Query,
  ParseIntPipe, BadRequestException, ValidationPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { ExpertsService } from './experts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestModificationDto } from './dto/request-modification.dto';
import { UpdateProfilDto } from './dto/update-profil.dto';

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

  @Get('by-domaines')
  async getExpertsByDomaines(@Query('domaines') domaines: string) {
    if (!domaines) return [];
    const domainesArray = domaines.split(',');
    return this.expertsService.findByDomaines(domainesArray);
  }

// src/experts/experts.controller.ts
@Put('profil')
@UseGuards(JwtAuthGuard)
updateProfil(@Request() req: any, @Body() body: any) {
  return this.expertsService.updateProfil(req.user.id, body);
}

  // ✅ Route pour l'admin (modification directe avec validation normale)
  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  async updateExpertByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProfilDto,
  ) {
    return this.expertsService.updateExpertDirectly(id, dto);
  }

  @Post('photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: path.join(process.cwd(), 'uploads', 'photos'),
      filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
        return cb(new BadRequestException('Format d\'image non supporté'), false);
      }
      cb(null, true);
    },
  }))
  async uploadPhoto(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    return this.expertsService.updatePhoto(req.user.id, file.filename);
  }

  @Patch(':id/valider-modification')
  @UseGuards(JwtAuthGuard)
  validerModification(@Param('id', ParseIntPipe) id: number) {
    return this.expertsService.validerModification(id);
  }

  @Patch(':id/refuser-modification')
  @UseGuards(JwtAuthGuard)
  refuserModification(@Param('id', ParseIntPipe) id: number) {
    return this.expertsService.refuserModification(id);
  }
}