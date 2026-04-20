import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { PodcastService, CreatePodcastDto, UpdatePodcastDto } from './podcast.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expert } from '../user/expert.entity';

const podcastStorage = diskStorage({
  destination: (req, file, cb) => {
    let folder = './uploads/';
    if (file.fieldname === 'audio_file') folder += 'podcasts-audio';
    else if (file.fieldname === 'image_file') folder += 'podcasts-images';
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `podcast-${unique}${extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio_file' && file.mimetype !== 'audio/mpeg') {
    cb(new Error('Seuls les fichiers MP3 sont autorisés'), false);
  } else if (file.fieldname === 'image_file' && !file.mimetype.startsWith('image/')) {
    cb(new Error('Seules les images sont autorisées'), false);
  } else {
    cb(null, true);
  }
};

@Controller('podcasts')
export class PodcastController {
  constructor(
    private readonly podcastService: PodcastService,
    @InjectRepository(Expert)
    private expertRepo: Repository<Expert>,
  ) {}

  // ==================== ADMIN ====================
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.podcastService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number) {
    return this.podcastService.findOne(id);
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 },
      ],
      { storage: podcastStorage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } },
    ),
  )
  async create(
    @Body() dto: CreatePodcastDto,
    @UploadedFiles() files: { audio_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
  ) {
    const audio = files?.audio_file?.[0];
    const image = files?.image_file?.[0];
    return this.podcastService.create(dto, audio, image);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 },
      ],
      { storage: podcastStorage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } },
    ),
  )
  async update(
    @Param('id') id: number,
    @Body() dto: UpdatePodcastDto,
    @UploadedFiles() files: { audio_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
  ) {
    const audio = files?.audio_file?.[0];
    const image = files?.image_file?.[0];
    return this.podcastService.update(id, dto, audio, image);
  }

  @Patch('admin/:id/statut')
  @UseGuards(JwtAuthGuard)
  async updateStatut(
    @Param('id') id: number,
    @Body('statut') statut: 'en_attente' | 'publie' | 'refuse',
  ) {
    return this.podcastService.updateStatut(id, statut);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: number) {
    return this.podcastService.delete(id);
  }

  // ==================== EXPERTS ====================
  @Post('expert/proposer')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'audio_file', maxCount: 1 },
        { name: 'image_file', maxCount: 1 },
      ],
      { storage: podcastStorage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } },
    ),
  )
  async proposerParExpert(
    @Body() dto: CreatePodcastDto,
    @UploadedFiles() files: { audio_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
    @Request() req: any,
  ) {
    // Récupérer l'expert associé à l'utilisateur connecté
    const expert = await this.expertRepo.findOne({
      where: { user_id: req.user.id },
    });
    if (!expert) {
      throw new Error('Expert non trouvé pour cet utilisateur');
    }
    const audio = files?.audio_file?.[0];
    const image = files?.image_file?.[0];
    return this.podcastService.createByExpert(dto, expert.id, audio, image);
  }

  @Get('expert/mes-podcasts')
  @UseGuards(JwtAuthGuard)
  async getMesPodcasts(@Request() req: any) {
    const expert = await this.expertRepo.findOne({
      where: { user_id: req.user.id },
    });
    if (!expert) {
      throw new Error('Expert non trouvé');
    }
    return this.podcastService.findByExpert(expert.id);
  }

  // ==================== PUBLIQUES ====================
  @Get('public')
  async findPublished() {
    return this.podcastService.findPublished();
  }

  @Get('public/:id')
  async findOnePublic(@Param('id') id: number) {
    return this.podcastService.findOne(id);
  }
}