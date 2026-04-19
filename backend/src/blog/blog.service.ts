// src/blog/blog.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './blog.entity';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepo: Repository<Blog>,
  ) {}

  // ADMIN
  async create(data: any, imageFile: any, pdfFile: any): Promise<Blog> {
    const article = this.blogRepo.create({
      titre: data.titre,
      description: data.description,
      contenu: data.contenu,
      type: data.type || 'article',
      categorie: data.categorie,
      duree_lecture: data.duree_lecture,
      statut: data.statut || 'brouillon',
      image: imageFile?.filename || null,
      pdf: pdfFile?.filename || null,
    });
    return await this.blogRepo.save(article);
  }

  async findAllAdmin(): Promise<Blog[]> {
    return this.blogRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Blog> {
    const article = await this.blogRepo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Article non trouvé');
    return article;
  }

  async update(id: number, data: any, imageFile: any, pdfFile: any): Promise<Blog> {
    const article = await this.findOne(id);
    if (imageFile) data.image = imageFile.filename;
    if (pdfFile) data.pdf = pdfFile.filename;
    Object.assign(article, data);
    return await this.blogRepo.save(article);
  }

  async updateStatut(id: number, statut: string): Promise<Blog> {
    const article = await this.findOne(id);
    article.statut = statut;
    return await this.blogRepo.save(article);
  }

  async delete(id: number): Promise<void> {
    const article = await this.findOne(id);
    await this.blogRepo.remove(article);
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
    await this.blogRepo.save(article);
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