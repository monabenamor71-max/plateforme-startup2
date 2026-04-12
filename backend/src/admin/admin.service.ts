import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { Startup } from '../user/startup.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
    @InjectRepository(Startup) private startupRepo: Repository<Startup>,
    private mailService: MailService,
  ) {}

  getAllUsers() {
    return this.userRepo.find();
  }

  async deleteUser(id: number) {
    await this.userRepo.delete(id);
    return { message: 'Utilisateur supprime' };
  }

  async toggleUserStatut(id: number, statut: string) {
    await this.userRepo.update(id, { statut });
    return { message: 'Statut mis a jour' };
  }

  getAllExperts() {
    return this.expertRepo.find({ relations: ['user'] });
  }

  getExpertEnAttente() {
    return this.expertRepo.find({ where: { statut: 'en_attente' }, relations: ['user'] });
  }

  // Récupérer les experts qui ont demandé une modification
  async getExpertsModifications() {
    return this.expertRepo.find({
      where: { modification_demandee: true },
      relations: ['user'],
    });
  }

  // Valider une modification d'expert
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

    // Appliquer les champs modifiés
    Object.keys(modifications).forEach(key => {
      if (key in expert) {
        (expert as any)[key] = modifications[key];
      }
    });

    // Réinitialiser les flags (utiliser une chaîne vide car la colonne n'est pas nullable)
    expert.modification_demandee = false;
    expert.modifications_en_attente = '';

    await this.expertRepo.save(expert);

    // Envoyer un email de confirmation à l'expert (optionnel)
    // Décommentez et implémentez les méthodes dans MailService si nécessaire
    /*
    try {
      await this.mailService.sendModificationAccepteeEmail(expert.user.nom, expert.user.email);
    } catch(e) { console.log(e.message); }
    */

    return { message: 'Modifications validées et appliquées' };
  }

  // Refuser une modification d'expert
  async refuserModificationExpert(id: number) {
    const expert = await this.expertRepo.findOne({ where: { id }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouvé');

    // Réinitialiser les flags sans appliquer les modifications
    expert.modification_demandee = false;
    expert.modifications_en_attente = '';

    await this.expertRepo.save(expert);

    // Envoyer un email de refus (optionnel)
    /*
    try {
      await this.mailService.sendModificationRefuseeEmail(expert.user.nom, expert.user.email);
    } catch(e) { console.log(e.message); }
    */

    return { message: 'Modifications refusées' };
  }

  async validerExpert(id: number) {
    const expert = await this.expertRepo.findOne({ where: { id }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouve');
    await this.expertRepo.update(id, { statut: 'valide' });
    await this.userRepo.update(expert.user_id, { statut: 'actif' });
    try { await this.mailService.sendValidationEmail(expert.user.nom, expert.user.email); } catch(e) { console.log(e.message); }
    return { message: 'Expert valide' };
  }

  async refuserExpert(id: number) {
    const expert = await this.expertRepo.findOne({ where: { id }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouve');
    await this.expertRepo.update(id, { statut: 'refuse' });
    await this.userRepo.update(expert.user_id, { statut: 'inactif' });
    try { await this.mailService.sendRefusEmail(expert.user.nom, expert.user.email); } catch(e) { console.log(e.message); }
    return { message: 'Expert refuse' };
  }

  getAllStartups() {
    return this.startupRepo.find({ relations: ['user'] });
  }

  getStartupEnAttente() {
    return this.startupRepo.find({ where: { statut: 'en_attente' }, relations: ['user'] });
  }

  async validerStartup(id: number) {
    const startup = await this.startupRepo.findOne({ where: { id }, relations: ['user'] });
    if (!startup) throw new NotFoundException('Startup non trouvee');
    await this.startupRepo.update(id, { statut: 'valide' });
    await this.userRepo.update(startup.user_id, { statut: 'actif' });
    try { await this.mailService.sendValidationEmail(startup.user.nom, startup.user.email); } catch(e) { console.log(e.message); }
    return { message: 'Startup validee' };
  }

  async refuserStartup(id: number) {
    const startup = await this.startupRepo.findOne({ where: { id }, relations: ['user'] });
    if (!startup) throw new NotFoundException('Startup non trouvee');
    await this.startupRepo.update(id, { statut: 'refuse' });
    await this.userRepo.update(startup.user_id, { statut: 'inactif' });
    try { await this.mailService.sendRefusEmail(startup.user.nom, startup.user.email); } catch(e) { console.log(e.message); }
    return { message: 'Startup refusee' };
  }

  async getStats() {
    const experts  = await this.expertRepo.count();
    const startups = await this.startupRepo.count();
    return { experts, startups };
  }
}