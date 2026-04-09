import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private repo: Repository<Comment>,
  ) {}

  async create(data: { 
    comment: string; 
    nom: string; 
    email: string; 
    site: string; 
    articleId: number;
  }) {
    console.log('📝 Service - Création commentaire:', data);
    
    const comment = new Comment();
    comment.comment = data.comment;
    comment.nom = data.nom;
    comment.email = data.email;
    comment.site = data.site || '';
    comment.articleId = data.articleId;
    comment.statut = 'en_attente';
    // Ne pas assigner userId, il sera undefined (ce qui est accepté car nullable: true)
    // comment.userId = null; ← Supprimer cette ligne
    
    const saved = await this.repo.save(comment);
    console.log('✅ Service - Commentaire sauvegardé:', saved);
    return saved;
  }

  async getAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async getEnAttente() {
    return this.repo.find({ 
      where: { statut: 'en_attente' }, 
      order: { createdAt: 'DESC' } 
    });
  }

  async approuver(id: number) {
    await this.repo.update(id, { statut: 'approuve' });
    return this.repo.findOne({ where: { id } });
  }

  async refuser(id: number) {
    await this.repo.update(id, { statut: 'refuse' });
    return this.repo.findOne({ where: { id } });
  }

  async supprimer(id: number) {
    await this.repo.delete(id);
    return { success: true };
  }

  async getByArticle(articleId: number) {
    return this.repo.find({ 
      where: { articleId, statut: 'approuve' }, 
      order: { createdAt: 'DESC' } 
    });
  }
}