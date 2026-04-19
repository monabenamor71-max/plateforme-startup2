// src/formations/formations.controller.ts
import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FormationsService } from './formations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('formations')
export class FormationsController {
  constructor(private formationsService: FormationsService) {}

  // Routes experts
  @Post('expert/proposer')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/formations',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `formation-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async proposerParExpert(@Body() body: any, @UploadedFile() file: any, @Request() req: any) {
    const expertId = req.user.id;
    if (!expertId) throw new Error('Expert non authentifié');
    return this.formationsService.createFromExpert(body, file, expertId);
  }

  @Get('expert/mes-formations')
  @UseGuards(JwtAuthGuard)
  async getMesFormations(@Request() req: any) {
    const expertId = req.user.id;
    return this.formationsService.findByExpert(expertId);
  }

  // Routes admin
  @Post('admin/create')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/formations',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `formation-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async create(@Body() body: any, @UploadedFile() file: any) {
    return this.formationsService.create(body, file);
  }

  @Get('admin/all')
  async findAll() {
    return this.formationsService.findAll();
  }

  @Put('admin/:id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/formations',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `formation-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async update(@Param('id') id: number, @Body() body: any, @UploadedFile() file: any) {
    return this.formationsService.update(id, body, file);
  }

  @Patch('admin/:id/statut')
  async updateStatut(@Param('id') id: number, @Body() body: { statut: string; commentaire?: string }) {
    return this.formationsService.updateStatut(id, body.statut, body.commentaire);
  }

  @Delete('admin/:id')
  async delete(@Param('id') id: number) {
    return this.formationsService.delete(id);
  }

  // Routes publiques
  @Get('public')
  async findPublished() {
    return this.formationsService.findPublished();
  }

  @Get('public/:id')
  async findOne(@Param('id') id: number) {
    return this.formationsService.findOne(id);
  }
}