import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FormationsService } from './formations.service';

@Controller('formations')
export class FormationsController {
  constructor(private formationsService: FormationsService) {}

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

  @Get('public')
  async findPublished() {
    return this.formationsService.findPublished();
  }

  // ❌ SUPPRIMER CES DEUX ROUTES
  // @Get('formations')
  // async findFormations() {
  //   return this.formationsService.findFormations();
  // }

  // @Get('podcasts')
  // async findPodcasts() {
  //   return this.formationsService.findPodcasts();
  // }

  @Get('public/:id')
  async findOne(@Param('id') id: number) {
    return this.formationsService.findOne(id);
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
  async updateStatut(@Param('id') id: number, @Body('statut') statut: string) {
    return this.formationsService.updateStatut(id, statut);
  }

  @Delete('admin/:id')
  async delete(@Param('id') id: number) {
    return this.formationsService.delete(id);
  }
}