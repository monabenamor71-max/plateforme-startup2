// src/blog/blog.controller.ts
import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, UseInterceptors, UploadedFiles,
  UseGuards, Query,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BlogService } from './blog.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const storage = diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === 'image') {
      cb(null, './uploads/articles-img');
    } else {
      cb(null, './uploads/articles-pdf');
    }
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    if (file.fieldname === 'image') {
      cb(null, `article-${unique}${extname(file.originalname)}`);
    } else {
      cb(null, `article-${unique}.pdf`);
    }
  },
});

@Controller('articles')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Post('admin/create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ], { storage }))
  async create(
    @Body() body: any,
    @UploadedFiles() files: { image?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ) {
    const imageFile = files?.image?.[0];
    const pdfFile = files?.pdf?.[0];
    return this.blogService.create(body, imageFile, pdfFile);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async findAllAdmin() {
    return this.blogService.findAllAdmin();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  async findOneAdmin(@Param('id') id: number) {
    return this.blogService.findOne(id);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'image', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
  ], { storage }))
  async update(
    @Param('id') id: number,
    @Body() body: any,
    @UploadedFiles() files: { image?: Express.Multer.File[]; pdf?: Express.Multer.File[] },
  ) {
    const imageFile = files?.image?.[0];
    const pdfFile = files?.pdf?.[0];
    return this.blogService.update(id, body, imageFile, pdfFile);
  }

  @Patch('admin/:id/statut')
  @UseGuards(JwtAuthGuard)
  async updateStatut(@Param('id') id: number, @Body('statut') statut: string) {
    return this.blogService.updateStatut(id, statut);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: number) {
    return this.blogService.delete(id);
  }

  // PUBLIQUES
  @Get('public')
  async findPublished(@Query('categorie') categorie?: string) {
    return this.blogService.findPublished(categorie);
  }

  @Get('public/:id')
  async findOnePublic(@Param('id') id: number) {
    return this.blogService.findOnePublic(id);
  }

  @Get('public/categories/list')
  async getCategories() {
    return this.blogService.getCategories();
  }
}