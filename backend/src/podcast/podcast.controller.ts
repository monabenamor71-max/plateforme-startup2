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
  ValidationPipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { PodcastService } from './podcast.service';
import { CreatePodcastDto, UpdatePodcastDto } from './dto/podcast.dto';
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
    cb(new BadRequestException('Seuls les fichiers MP3 sont autorisés'), false);
  } else if (file.fieldname === 'image_file' && !file.mimetype.startsWith('image/')) {
    cb(new BadRequestException('Seules les images sont autorisées'), false);
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

  private async getExpertIdFromUser(userId: number): Promise<number> {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) throw new BadRequestException('Expert non trouvé');
    return expert.id;
  }

  // ==================== ADMIN ====================
  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.podcastService.findAll();
  }

  @Get('admin/:id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
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
    @Body(ValidationPipe) dto: CreatePodcastDto,
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
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdatePodcastDto,
    @UploadedFiles() files: { audio_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
  ) {
    const audio = files?.audio_file?.[0];
    const image = files?.image_file?.[0];
    return this.podcastService.update(id, dto, audio, image);
  }

  @Patch('admin/:id/statut')
  @UseGuards(JwtAuthGuard)
  async updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body('statut') statut: 'en_attente' | 'publie' | 'refuse',
  ) {
    if (!statut) throw new BadRequestException('Statut requis');
    return this.podcastService.updateStatut(id, statut);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number) {
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
    @Body(ValidationPipe) dto: CreatePodcastDto,
    @UploadedFiles() files: { audio_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
    @Request() req: any,
  ) {
    const expertId = await this.getExpertIdFromUser(req.user.id);
    const audio = files?.audio_file?.[0];
    const image = files?.image_file?.[0];
    return this.podcastService.createByExpert(dto, expertId, audio, image);
  }

  @Get('expert/mes-podcasts')
  @UseGuards(JwtAuthGuard)
  async getMesPodcasts(@Request() req: any) {
    const expertId = await this.getExpertIdFromUser(req.user.id);
    return this.podcastService.findByExpert(expertId);
  }

  @Put('expert/modifier/:id')
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
  async modifierParExpert(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdatePodcastDto,
    @UploadedFiles() files: { audio_file?: Express.Multer.File[]; image_file?: Express.Multer.File[] },
    @Request() req: any,
  ) {
    const expertId = await this.getExpertIdFromUser(req.user.id);
    const audio = files?.audio_file?.[0];
    const image = files?.image_file?.[0];
    return this.podcastService.updateByExpert(id, expertId, dto, audio, image);
  }

  @Delete('expert/supprimer/:id')
  @UseGuards(JwtAuthGuard)
  async supprimerParExpert(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const expertId = await this.getExpertIdFromUser(req.user.id);
    return this.podcastService.deleteByExpert(id, expertId);
  }

  // ==================== PUBLIQUES ====================
  @Get('public')
  async findPublished() {
    return this.podcastService.findPublished();
  }

  @Get('public/:id')
  async findOnePublic(@Param('id', ParseIntPipe) id: number) {
    return this.podcastService.findOne(id);
  }
}