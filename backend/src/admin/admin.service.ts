import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { Startup } from '../user/startup.entity';
import { Blog } from '../blog/blog.entity';
import { MailService } from '../mail/mail.service';
import { MediaService } from '../media/media.service';
import { PodcastService, CreatePodcastDto, UpdatePodcastDto } from '../podcast/podcast.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
    @InjectRepository(Startup) private startupRepo: Repository<Startup>,
    @InjectRepository(Blog) private blogRepo: Repository<Blog>,
    private mailService: MailService,
    private mediaService: MediaService,
    private podcastService: PodcastService,
    private dataSource: DataSource,
  ) {}

  // ==================== USERS ====================
  getAllUsers() {
    return this.userRepo.find();
  }

  async deleteUser(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur ${id} introuvable`);
    await this.userRepo.delete(id);
    return { message: 'Utilisateur supprimé' };
  }

  async toggleUserStatut(id: number, statut: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur ${id} introuvable`);
    await this.userRepo.update(id, { statut });
    return { message: 'Statut mis à jour' };
  }

  // ==================== EXPERTS ====================
  getAllExperts() {
    return this.expertRepo.find({ relations: ['user'], order: { createdAt: 'DESC' } });
  }

  getExpertEnAttente() {
    return this.expertRepo.find({ where: { statut: 'en_attente' }, relations: ['user'] });
  }

  async getExpertsModifications() {
    return this.expertRepo.find({ where: { modification_demandee: true }, relations: ['user'] });
  }

  async validerModificationExpert(id: number) {
    const expert = await this.expertRepo.findOne({ where: { id }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouvé');
    if (!expert.modifications_en_attente) throw new NotFoundException('Aucune modification en attente');

    let modifications: any;
    try {
      modifications = JSON.parse(expert.modifications_en_attente);
    } catch {
      throw new BadRequestException('Format des modifications invalide');
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

  // Version avec transaction pour validation expert + email
  async validerExpert(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const expert = await queryRunner.manager.findOne(Expert, { where: { id }, relations: ['user'] });
      if (!expert) throw new NotFoundException('Expert non trouvé');

      expert.statut = 'valide';
      await queryRunner.manager.save(expert);

      await queryRunner.manager.update(User, expert.user_id, { statut: 'actif' });

      // Envoi d'email (peut échouer)
      await this.mailService.sendValidationEmail(expert.user.nom, expert.user.email);

      await queryRunner.commitTransaction();
      this.logger.log(`Expert ${id} validé avec succès`);
      return { message: 'Expert validé' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erreur lors de la validation de l'expert ${id}: ${err.message}`);
      throw new BadRequestException(err.message || 'Erreur lors de la validation');
    } finally {
      await queryRunner.release();
    }
  }

  async refuserExpert(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const expert = await queryRunner.manager.findOne(Expert, { where: { id }, relations: ['user'] });
      if (!expert) throw new NotFoundException('Expert non trouvé');

      expert.statut = 'refuse';
      await queryRunner.manager.save(expert);

      await queryRunner.manager.update(User, expert.user_id, { statut: 'inactif' });

      await this.mailService.sendRefusEmail(expert.user.nom, expert.user.email);

      await queryRunner.commitTransaction();
      this.logger.log(`Expert ${id} refusé`);
      return { message: 'Expert refusé' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erreur lors du refus de l'expert ${id}: ${err.message}`);
      throw new BadRequestException(err.message || 'Erreur lors du refus');
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== STARTUPS ====================
  getAllStartups() {
    return this.startupRepo.find({ relations: ['user'] });
  }

  getStartupEnAttente() {
    return this.startupRepo.find({ where: { statut: 'en_attente' }, relations: ['user'] });
  }

  async validerStartup(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const startup = await queryRunner.manager.findOne(Startup, { where: { id }, relations: ['user'] });
      if (!startup) throw new NotFoundException('Startup non trouvée');

      startup.statut = 'valide';
      await queryRunner.manager.save(startup);

      await queryRunner.manager.update(User, startup.user_id, { statut: 'actif' });

      await this.mailService.sendValidationEmail(startup.user.nom, startup.user.email);

      await queryRunner.commitTransaction();
      this.logger.log(`Startup ${id} validée`);
      return { message: 'Startup validée' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erreur lors de la validation de la startup ${id}: ${err.message}`);
      throw new BadRequestException(err.message || 'Erreur lors de la validation');
    } finally {
      await queryRunner.release();
    }
  }

  async refuserStartup(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const startup = await queryRunner.manager.findOne(Startup, { where: { id }, relations: ['user'] });
      if (!startup) throw new NotFoundException('Startup non trouvée');

      startup.statut = 'refuse';
      await queryRunner.manager.save(startup);

      await queryRunner.manager.update(User, startup.user_id, { statut: 'inactif' });

      await this.mailService.sendRefusEmail(startup.user.nom, startup.user.email);

      await queryRunner.commitTransaction();
      this.logger.log(`Startup ${id} refusée`);
      return { message: 'Startup refusée' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Erreur lors du refus de la startup ${id}: ${err.message}`);
      throw new BadRequestException(err.message || 'Erreur lors du refus');
    } finally {
      await queryRunner.release();
    }
  }

  // ==================== STATS ====================
  async getStats() {
    const experts = await this.expertRepo.count();
    const startups = await this.startupRepo.count();
    return { experts, startups };
  }

  // ==================== BLOG ====================
  async getAllArticlesAdmin() {
    return this.blogRepo.find({ order: { createdAt: 'DESC' } });
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
      categorie: data.categorie,
      duree_lecture: data.duree_lecture,
      statut: data.statut || 'brouillon',
      image: imageFile?.filename || null,
      pdf: pdfFile?.filename || null,
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

  // ==================== MÉDIAS ====================
  async getAllMediasAdmin() {
    return this.mediaService.findAllAdmin();
  }

  async getMediaById(id: number) {
    return this.mediaService.findOne(id);
  }

  async createMedia(data: any, miniatureFile: Express.Multer.File) {
    return this.mediaService.create(data, miniatureFile);
  }

  async updateMedia(id: number, data: any, miniatureFile: Express.Multer.File) {
    return this.mediaService.update(id, data, miniatureFile);
  }

  async deleteMedia(id: number) {
    return this.mediaService.delete(id);
  }

  // ==================== PODCASTS ====================
  async getAllPodcastsAdmin() {
    return this.podcastService.findAll();
  }

  async getPodcastById(id: number) {
    return this.podcastService.findOne(id);
  }

  async createPodcast(dto: CreatePodcastDto, audioFile?: Express.Multer.File, imageFile?: Express.Multer.File) {
    return this.podcastService.create(dto, audioFile, imageFile);
  }

  async updatePodcast(id: number, dto: UpdatePodcastDto, audioFile?: Express.Multer.File, imageFile?: Express.Multer.File) {
    return this.podcastService.update(id, dto, audioFile, imageFile);
  }

  async updatePodcastStatut(id: number, statut: 'en_attente' | 'publie' | 'refuse') {
    return this.podcastService.updateStatut(id, statut);
  }

  async deletePodcast(id: number) {
    return this.podcastService.delete(id);
  }
}