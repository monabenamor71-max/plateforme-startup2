// src/blog/blog.service.ts
import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';

export class CreateArticleDto {
  titre: string;
  description?: string;
  contenu?: string;
  type?: string;
  categorie?: string;
  duree_lecture?: string;
  statut?: string;
}

export class UpdateArticleDto {
  titre?: string;
  description?: string;
  contenu?: string;
  type?: string;
  categorie?: string;
  duree_lecture?: string;
  statut?: string;
}

export class UpdateStatutDto {
  statut: string;
}

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}

  private async findOneOrFail(id: number): Promise<Blog> {
    const article = await this.blogRepo.findOne({ where: { id } });
    if (!article) throw new NotFoundException(`Article ${id} non trouvé`);
    return article;
  }

  // ADMIN
  async create(dto: CreateArticleDto, imageFile?: Express.Multer.File, pdfFile?: Express.Multer.File): Promise<Blog> {
    const articleData: Partial<Blog> = {
      titre: dto.titre,
      description: dto.description,
      contenu: dto.contenu,
      type: dto.type || 'article',
      categorie: dto.categorie,
      duree_lecture: dto.duree_lecture,
      statut: dto.statut || 'brouillon',
    };
    if (imageFile) articleData.image = imageFile.filename;
    if (pdfFile) articleData.pdf = pdfFile.filename;
    const article = this.blogRepo.create(articleData);
    const saved = await this.blogRepo.save(article);
    if (!saved || !saved.id) {
      throw new BadRequestException('Erreur lors de la création de l’article');
    }
    this.logger.log(`Article créé : ${saved.id} - ${saved.titre}`);
    return saved;
  }

  async findAllAdmin(): Promise<Blog[]> {
    return this.blogRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Blog> {
    return this.findOneOrFail(id);
  }

  async update(id: number, dto: UpdateArticleDto, imageFile?: Express.Multer.File, pdfFile?: Express.Multer.File): Promise<Blog> {
    const article = await this.findOneOrFail(id);
    if (imageFile) article.image = imageFile.filename;
    if (pdfFile) article.pdf = pdfFile.filename;
    if (dto.titre !== undefined) article.titre = dto.titre;
    if (dto.description !== undefined) article.description = dto.description;
    if (dto.contenu !== undefined) article.contenu = dto.contenu;
    if (dto.type !== undefined) article.type = dto.type;
    if (dto.categorie !== undefined) article.categorie = dto.categorie;
    if (dto.duree_lecture !== undefined) article.duree_lecture = dto.duree_lecture;
    if (dto.statut !== undefined) article.statut = dto.statut;
    const updated = await this.blogRepo.save(article);
    if (!updated) {
      throw new BadRequestException(`Erreur lors de la mise à jour de l’article ${id}`);
    }
    this.logger.log(`Article ${id} mis à jour`);
    return updated;
  }

  async updateStatut(id: number, dto: UpdateStatutDto): Promise<Blog> {
    const article = await this.findOneOrFail(id);
    article.statut = dto.statut;
    const updated = await this.blogRepo.save(article);
    if (!updated) {
      throw new BadRequestException(`Erreur lors de la mise à jour du statut de l’article ${id}`);
    }
    this.logger.log(`Article ${id} : statut changé à ${dto.statut}`);
    return updated;
  }

  async delete(id: number): Promise<void> {
    const article = await this.findOneOrFail(id);
    const deleteResult = await this.blogRepo.delete({ id });
    if (deleteResult.affected === 0) {
      throw new BadRequestException(`Impossible de supprimer l’article ${id}`);
    }
    this.logger.log(`Article ${id} supprimé`);
  }

  // PUBLIQUES
  async findPublished(categorie?: string): Promise<Blog[]> {
    const query = this.blogRepo
      .createQueryBuilder('blog')
      .where('blog.statut = :statut', { statut: 'publié' })
      .orderBy('blog.createdAt', 'DESC');

    if (categorie && categorie !== 'Toutes') {
      query.andWhere('blog.categorie = :categorie', { categorie });
    }
    return query.getMany();
  }

  async findOnePublic(id: number): Promise<Blog> {
    const article = await this.blogRepo.findOne({
      where: { id, statut: 'publié' },
    });
    if (!article) throw new NotFoundException('Article non trouvé ou non publié');
    article.vues += 1;
    const saved = await this.blogRepo.save(article);
    if (!saved) {
      // L'incrémentation a échoué mais on retourne l'article quand même (pas bloquant)
      this.logger.error(`Impossible d'incrémenter les vues pour l'article ${id}`);
    }
    return article;
  }

  async getCategories(): Promise<string[]> {
    const result = await this.blogRepo
      .createQueryBuilder('blog')
      .select('DISTINCT blog.categorie')
      .where('blog.statut = :statut', { statut: 'publié' })
      .andWhere('blog.categorie IS NOT NULL')
      .getRawMany();
    return result.map((r) => r.blog_categorie).filter(Boolean);
  }
}