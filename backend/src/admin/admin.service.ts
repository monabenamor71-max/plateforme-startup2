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
    return this.expertRepo.find({
      where: { statut: 'en_attente' },
      relations: ['user'],
    });
  }

  async validerExpert(id: number) {
    const expert = await this.expertRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!expert) throw new NotFoundException('Expert non trouve');
    await this.expertRepo.update(id, { statut: 'valide' });
    await this.userRepo.update(expert.user_id, { statut: 'actif' });
    try {
      await this.mailService.sendValidationEmail(expert.user.nom, expert.user.email);
    } catch(e) { console.log('Email erreur:', e.message); }
    return { message: 'Expert valide' };
  }

  async refuserExpert(id: number) {
    const expert = await this.expertRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!expert) throw new NotFoundException('Expert non trouve');
    await this.expertRepo.update(id, { statut: 'refuse' });
    await this.userRepo.update(expert.user_id, { statut: 'inactif' });
    try {
      await this.mailService.sendRefusEmail(expert.user.nom, expert.user.email);
    } catch(e) { console.log('Email erreur:', e.message); }
    return { message: 'Expert refuse' };
  }

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
    const startup = await this.startupRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!startup) throw new NotFoundException('Startup non trouvee');
    await this.startupRepo.update(id, { statut: 'valide' });
    await this.userRepo.update(startup.user_id, { statut: 'actif' });
    try {
      await this.mailService.sendValidationEmail(startup.user.nom, startup.user.email);
    } catch(e) { console.log('Email erreur:', e.message); }
    return { message: 'Startup validee' };
  }

  async refuserStartup(id: number) {
    const startup = await this.startupRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!startup) throw new NotFoundException('Startup non trouvee');
    await this.startupRepo.update(id, { statut: 'refuse' });
    await this.userRepo.update(startup.user_id, { statut: 'inactif' });
    try {
      await this.mailService.sendRefusEmail(startup.user.nom, startup.user.email);
    } catch(e) { console.log('Email erreur:', e.message); }
    return { message: 'Startup refusee' };
  }

  async getStats() {
    const experts  = await this.expertRepo.count();
    const startups = await this.startupRepo.count();
    return { experts, startups };
  }
}