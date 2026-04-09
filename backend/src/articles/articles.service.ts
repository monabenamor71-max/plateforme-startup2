import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from './article.entity';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private repo: Repository<Article>,
  ) {}

  async getPublics(limit?: number) {
    const q = this.repo.createQueryBuilder('a')
      .where('a.statut = :s', { s: 'publie' })
      .orderBy('a.createdAt', 'DESC');
    if (limit) q.take(limit);
    return q.getMany();
  }

  getDerniersPublics() {
    return this.getPublics(3);
  }

  getAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  getById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  async create(data: any, imageFile?: any) {
    const tags = data.tags
      ? (typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) : data.tags)
      : [];

    const article = this.repo.create({
      titre: data.titre,
      description: data.description,
      contenu: data.contenu,
      type: data.type,
      categorie: data.categorie,
      tags: tags,
      duree_lecture: data.duree_lecture,
      statut: data.statut || 'brouillon',
      image: imageFile ? imageFile.filename : null,
    });
    return this.repo.save(article);
  }

  async update(id: number, data: any, imageFile?: any) {
    const existing = await this.repo.findOne({ where: { id } });
    if (!existing) return null;

    const tags = data.tags
      ? (typeof data.tags === 'string' ? data.tags.split(',').map((t: string) => t.trim()) : data.tags)
      : existing.tags;

    const updateData: any = {
      titre: data.titre || existing.titre,
      description: data.description || existing.description,
      contenu: data.contenu || existing.contenu,
      type: data.type || existing.type,
      categorie: data.categorie || existing.categorie,
      tags: tags,
      duree_lecture: data.duree_lecture || existing.duree_lecture,
      statut: data.statut || existing.statut,
    };

    if (imageFile) updateData.image = imageFile.filename;

    await this.repo.update(id, updateData);
    return this.repo.findOne({ where: { id } });
  }

  async publier(id: number) {
    await this.repo.update(id, { statut: 'publie' });
    return this.repo.findOne({ where: { id } });
  }

  async archiver(id: number) {
    await this.repo.update(id, { statut: 'archive' });
    return this.repo.findOne({ where: { id } });
  }

  async supprimer(id: number) {
    await this.repo.delete(id);
    return { success: true };
  }

  async incrementerVues(id: number) {
    await this.repo.increment({ id }, 'vues', 1);
  }
}