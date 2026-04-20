import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepo: Repository<Media>,
  ) {}

  async create(data: any, miniatureFile?: Express.Multer.File): Promise<Media> {
    const mediaData: Partial<Media> = {
      titre: data.titre,
      description: data.description,
      url: data.url,
      type: data.type,
      miniature: miniatureFile?.filename || data.miniature || undefined,
      // duree: data.duree,  ← supprimé (colonne inexistante)
      emission: data.emission,
      date_publication: data.date_publication ? new Date(data.date_publication) : undefined,
      categorie: data.categorie,
      featured: data.featured === 'true' || data.featured === true,
      statut: data.statut,
    };
    const media = this.mediaRepo.create(mediaData);
    return await this.mediaRepo.save(media);
  }

  async findAllAdmin(): Promise<Media[]> {
    return this.mediaRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Media> {
    const media = await this.mediaRepo.findOne({ where: { id } });
    if (!media) throw new NotFoundException('Média non trouvé');
    return media;
  }

  async update(id: number, data: any, miniatureFile?: Express.Multer.File): Promise<Media> {
    const media = await this.findOne(id);
    if (miniatureFile) data.miniature = miniatureFile.filename;
    if (data.date_publication) data.date_publication = new Date(data.date_publication);
    Object.assign(media, data);
    return await this.mediaRepo.save(media);
  }

  async delete(id: number): Promise<void> {
    const media = await this.findOne(id);
    await this.mediaRepo.remove(media);
  }

  async findPublished(featuredOnly = false): Promise<Media[]> {
    const query = this.mediaRepo
      .createQueryBuilder('media')
      .where('media.statut = :statut', { statut: 'publie' })
      .orderBy('media.createdAt', 'DESC');
    if (featuredOnly) query.andWhere('media.featured = :featured', { featured: true });
    return query.getMany();
  }

  async findOnePublic(id: number): Promise<Media> {
    const media = await this.mediaRepo.findOne({ where: { id, statut: 'publie' } });
    if (!media) throw new NotFoundException('Média non trouvé ou non publié');
    return media;
  }
}