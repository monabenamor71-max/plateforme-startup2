// src/admin/admin.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { Startup } from '../user/startup.entity';
import { Blog } from '../blog/blog.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
    @InjectRepository(Startup) private startupRepo: Repository<Startup>,
    @InjectRepository(Blog) private blogRepo: Repository<Blog>,
    private mailService: MailService,
  ) {}

  // ==================== USERS ====================
  getAllUsers() {
    return this.userRepo.find();
  }

  async deleteUser(id: number) {
    await this.userRepo.delete(id);
    return { message: 'Utilisateur supprimé' };
  }

  async toggleUserStatut(id: number, statut: string) {
    await this.userRepo.update(id, { statut });
    return { message: 'Statut mis à jour' };
  }

  // ==================== EXPERTS ====================
  getAllExperts() {
    return this.expertRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  getExpertEnAttente() {
    return this.expertRepo.find({
      where: { statut: 'en_attente' },
      relations: ['user'],
    });
  }

  async getExpertsModifications() {
    return this.expertRepo.find({
      where: { modification_demandee: true },
      relations: ['user'],
    });
  }

  async validerModificationExpert(id: number) {
    const expert = await this.expertRepo.findOne({ where: { id }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouvé');
    if (!expert.modifications_en_attente) {
      throw new NotFoundException('Aucune modification en attente');
    }

    let modifications: any;
    try {
      modifications = JSON.parse(expert.modifications_en_attente);
    } catch {
      throw new Error('Format des modifications invalide');
    }

    if (modifications.domaine !== undefined) expert.domaine = modifications.domaine;
    if (modifications.description !== undefined) expert.description = modifications.description;
    if (modifications.localisation !== undefined) expert.localisation = modifications.localisation;
    if (modifications.experience !== undefined) expert.experience = modifications.experience;
    if (modifications.annee_debut_experience !== undefined) expert.annee_debut_experience = modifications.annee_debut_experience;
    if (modifications.telephone) {
      await this.userRepo.update(expert.user_id, { telephone: modifications.telephone });
    }

    expert.modification_demandee = false;
    expert.modifications_en_attente = '';

    await this.expertRepo.save(expert);
    return { message: 'Modifications validées et appliquées' };
  }

  async refuserModificationExpert(id: number) {
    const expert = await this.expertRepo.findOne({ where: { id }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouvé');

    expert.modification_demandee = false;
    expert.modifications_en_attente = '';

    await this.expertRepo.save(expert);
    return { message: 'Modifications refusées' };
  }

  async validerExpert(id: number) {
    const expert = await this.expertRepo.findOne({ where: { id }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouvé');
    await this.expertRepo.update(id, { statut: 'valide' });
    await this.userRepo.update(expert.user_id, { statut: 'actif' });
    try {
      await this.mailService.sendValidationEmail(expert.user.nom, expert.user.email);
    } catch(e) {
      console.log(e.message);
    }
    return { message: 'Expert validé' };
  }

  async refuserExpert(id: number) {
    const expert = await this.expertRepo.findOne({ where: { id }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouvé');
    await this.expertRepo.update(id, { statut: 'refuse' });
    await this.userRepo.update(expert.user_id, { statut: 'inactif' });
    try {
      await this.mailService.sendRefusEmail(expert.user.nom, expert.user.email);
    } catch(e) {
      console.log(e.message);
    }
    return { message: 'Expert refusé' };
  }

  // ==================== STARTUPS ====================
  getAllStartups() {
    return this.startupRepo.find({ relations: ['user'] });
  }

  getStartupEnAttente() {
    return this.startupRepo.find({
      where: { statut: 'en_attente' },
      relations: ['user'],
    });
  }

  async validerStartup(id: number) {
    const startup = await this.startupRepo.findOne({ where: { id }, relations: ['user'] });
    if (!startup) throw new NotFoundException('Startup non trouvée');
    await this.startupRepo.update(id, { statut: 'valide' });
    await this.userRepo.update(startup.user_id, { statut: 'actif' });
    try {
      await this.mailService.sendValidationEmail(startup.user.nom, startup.user.email);
    } catch(e) {
      console.log(e.message);
    }
    return { message: 'Startup validée' };
  }

  async refuserStartup(id: number) {
    const startup = await this.startupRepo.findOne({ where: { id }, relations: ['user'] });
    if (!startup) throw new NotFoundException('Startup non trouvée');
    await this.startupRepo.update(id, { statut: 'refuse' });
    await this.userRepo.update(startup.user_id, { statut: 'inactif' });
    try {
      await this.mailService.sendRefusEmail(startup.user.nom, startup.user.email);
    } catch(e) {
      console.log(e.message);
    }
    return { message: 'Startup refusée' };
  }

  // ==================== STATS ====================
  async getStats() {
    const experts  = await this.expertRepo.count();
    const startups = await this.startupRepo.count();
    return { experts, startups };
  }

  // ==================== BLOG (ARTICLES) ====================
  async getAllArticlesAdmin() {
    return this.blogRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findArticleById(id: number) {
    const article = await this.blogRepo.findOne({ where: { id } });
    if (!article) throw new NotFoundException('Article non trouvé');
    return article;
  }

  async createArticle(data: any, imageFile: any, pdfFile: any) {
    const article = this.blogRepo.create({
      titre: data.titre,
      description: data.description,
      contenu: data.contenu,
      type: data.type || 'article',
      categorie: data.categorie,       // ← remplace domaine
      duree_lecture: data.duree_lecture,
      statut: data.statut || 'brouillon',
      image: imageFile?.filename || null,
      pdf: pdfFile?.filename || null,  // ← ajout PDF
    });
    return this.blogRepo.save(article);
  }

  async updateArticle(id: number, data: any, imageFile: any, pdfFile: any) {
    const article = await this.findArticleById(id);
    if (imageFile) data.image = imageFile.filename;
    if (pdfFile) data.pdf = pdfFile.filename;
    Object.assign(article, data);
    return this.blogRepo.save(article);
  }

  async updateArticleStatut(id: number, statut: string) {
    const article = await this.findArticleById(id);
    article.statut = statut;
    return this.blogRepo.save(article);
  }

  async deleteArticle(id: number) {
    const article = await this.findArticleById(id);
    return this.blogRepo.remove(article);
  }
}