import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, Req, Query,
  UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

@Controller('articles')
export class ArticlesController {
  constructor(private svc: ArticlesService) {}

  @Get('publics')
  getPublics(@Query('limit') limit?: string) {
    return this.svc.getPublics(limit ? +limit : undefined);
  }

  @Get('derniers')
  getDerniers() {
    return this.svc.getDerniersPublics();
  }

  @Get('public/:id')
  async getPublicById(@Param('id') id: string) {
    await this.svc.incrementerVues(+id);
    return this.svc.getById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  getAll() {
    return this.svc.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/create')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/articles-img';
        ensureDir(uploadPath);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
      },
    }),
  }))
  create(@Body() body: any, @UploadedFile() imageFile?: any) {
    return this.svc.create(body, imageFile);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/:id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = './uploads/articles-img';
        ensureDir(uploadPath);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
      },
    }),
  }))
  update(@Param('id') id: string, @Body() body: any, @UploadedFile() imageFile?: any) {
    return this.svc.update(+id, body, imageFile);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/publier')
  publier(@Param('id') id: string) {
    return this.svc.publier(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/archiver')
  archiver(@Param('id') id: string) {
    return this.svc.archiver(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  supprimer(@Param('id') id: string) {
    return this.svc.supprimer(+id);
  }
}