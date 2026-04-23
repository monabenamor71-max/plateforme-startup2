import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Podcast } from './podcast.entity';
import * as fs from 'fs';
import * as path from 'path';

export class CreatePodcastDto {
  titre: string;
  description?: string;
  auteur?: string;
  domaine?: string;
  statut?: 'en_attente' | 'publie' | 'refuse';
}

export class UpdatePodcastDto {
  titre?: string;
  description?: string;
  auteur?: string;
  domaine?: string;
  statut?: 'en_attente' | 'publie' | 'refuse';
}

@Injectable()
export class PodcastService {
  constructor(
    @InjectRepository(Podcast)
    private podcastRepo: Repository<Podcast>,
  ) {}

  // ==================== ADMIN ====================
  async findAll(): Promise<Podcast[]> {
    return this.podcastRepo.find({ order: { date_creation: 'DESC' } });
  }

  async findOne(id: number): Promise<Podcast> {
    const podcast = await this.podcastRepo.findOne({ where: { id } });
    if (!podcast) throw new NotFoundException('Podcast non trouvé');
    return podcast;
  }

  async create(
    dto: CreatePodcastDto,
    audioFile?: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<Podcast> {
    const podcast = new Podcast();
    podcast.titre = dto.titre;
    podcast.description = dto.description || '';
    podcast.auteur = dto.auteur || '';
    podcast.domaine = dto.domaine || '';
    podcast.statut = dto.statut || 'en_attente';
    podcast.url_audio = audioFile?.filename || '';
    podcast.image = imageFile?.filename || '';
    return this.podcastRepo.save(podcast);
  }

  async update(
    id: number,
    dto: UpdatePodcastDto,
    audioFile?: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<Podcast> {
    const podcast = await this.findOne(id);
    if (audioFile && podcast.url_audio) {
      const oldPath = path.join(__dirname, '../../uploads/podcasts-audio', podcast.url_audio);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      podcast.url_audio = audioFile.filename;
    }
    if (imageFile && podcast.image) {
      const oldPath = path.join(__dirname, '../../uploads/podcasts-images', podcast.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      podcast.image = imageFile.filename;
    }
    if (dto.titre !== undefined) podcast.titre = dto.titre;
    if (dto.description !== undefined) podcast.description = dto.description;
    if (dto.auteur !== undefined) podcast.auteur = dto.auteur;
    if (dto.domaine !== undefined) podcast.domaine = dto.domaine;
    if (dto.statut !== undefined) podcast.statut = dto.statut;
    return this.podcastRepo.save(podcast);
  }

  async updateStatut(id: number, statut: 'en_attente' | 'publie' | 'refuse'): Promise<Podcast> {
    const podcast = await this.findOne(id);
    podcast.statut = statut;
    return this.podcastRepo.save(podcast);
  }

  async delete(id: number): Promise<void> {
    const podcast = await this.findOne(id);
    if (podcast.url_audio) {
      const audioPath = path.join(__dirname, '../../uploads/podcasts-audio', podcast.url_audio);
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    }
    if (podcast.image) {
      const imagePath = path.join(__dirname, '../../uploads/podcasts-images', podcast.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await this.podcastRepo.remove(podcast);
  }

  // ==================== EXPERTS ====================
  async createByExpert(
    dto: CreatePodcastDto,
    expertId: number,
    audioFile?: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<Podcast> {
    const podcast = new Podcast();
    podcast.titre = dto.titre;
    podcast.description = dto.description || '';
    podcast.auteur = dto.auteur || '';
    podcast.domaine = dto.domaine || '';
    podcast.statut = 'en_attente';
    podcast.url_audio = audioFile?.filename || '';
    podcast.image = imageFile?.filename || '';
    podcast.expert_id = expertId;
    return this.podcastRepo.save(podcast);
  }

  async findByExpert(expertId: number): Promise<Podcast[]> {
    return this.podcastRepo.find({
      where: { expert_id: expertId },
      order: { date_creation: 'DESC' },
    });
  }

  /** Modification par l'expert (vérifie l'appartenance) */
  async updateByExpert(
    podcastId: number,
    expertId: number,
    dto: UpdatePodcastDto,
    audioFile?: Express.Multer.File,
    imageFile?: Express.Multer.File,
  ): Promise<Podcast> {
    const podcast = await this.findOne(podcastId);
    if (podcast.expert_id !== expertId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce podcast');
    }
    // Seul l'admin peut changer le statut, on le bloque pour l'expert
    if (dto.statut !== undefined) delete dto.statut;
    return this.update(podcastId, dto, audioFile, imageFile);
  }

  /** Suppression par l'expert (vérifie l'appartenance) */
  async deleteByExpert(podcastId: number, expertId: number): Promise<void> {
    const podcast = await this.findOne(podcastId);
    if (podcast.expert_id !== expertId) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer ce podcast');
    }
    return this.delete(podcastId);
  }

  // ==================== PUBLIQUES ====================
  async findPublished(): Promise<Podcast[]> {
    return this.podcastRepo.find({
      where: { statut: 'publie' },
      order: { date_creation: 'DESC' },
    });
  }
}