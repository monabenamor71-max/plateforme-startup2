import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

const storage = diskStorage({
  destination: (_req, file, cb) => cb(null, './uploads/videos-miniatures'),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `miniature-${unique}${extname(file.originalname)}`);
  },
});

@Controller('medias')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // Routes admin
  @Post('videos/create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('miniature_file', { storage }))
  async create(@Body() body: any, @UploadedFile() miniatureFile: Express.Multer.File) {
    return this.mediaService.create(body, miniatureFile);
  }

  @Get('videos/admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAllAdmin() {
    return this.mediaService.findAllAdmin();
  }

  @Get('videos/admin/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOneAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOne(id);
  }

  @Put('videos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('miniature_file', { storage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @UploadedFile() miniatureFile: Express.Multer.File,
  ) {
    return this.mediaService.update(id, body, miniatureFile);
  }

  @Delete('videos/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.delete(id);
  }

  // Routes publiques
  @Get('videos/public')
  async findPublished(@Query('featured') featured?: string) {
    return this.mediaService.findPublished(featured === 'true');
  }

  @Get('videos/public/:id')
  async findOnePublic(@Param('id', ParseIntPipe) id: number) {
    return this.mediaService.findOnePublic(id);
  }
}