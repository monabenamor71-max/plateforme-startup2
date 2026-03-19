import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Expert } from '../experts/expert.entity';
import { Startup } from '../startups/startup.entity';
import { Temoignage } from '../temoignages/temoignage.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)       private userRepo: Repository<User>,
    @InjectRepository(Expert)     private expertRepo: Repository<Expert>,
    @InjectRepository(Startup)    private startupRepo: Repository<Startup>,
    @InjectRepository(Temoignage) private temoignageRepo: Repository<Temoignage>,
  ) {}

  async getStats() {
    const totalUsers         = await this.userRepo.count();
    const totalExperts       = await this.expertRepo.count();
    const totalStartups      = await this.startupRepo.count();
    const expertsValides     = await this.expertRepo.count({ where: { valide: true } });
    const expertsEnAttente   = await this.expertRepo.count({ where: { valide: false } });
    const temoignagesAttente = await this.temoignageRepo.count({ where: { statut: 'en_attente' } });
    return { totalUsers, totalExperts, totalStartups, expertsValides, expertsEnAttente, temoignagesAttente };
  }

  async getUsers() {
    return this.userRepo.find();
  }

  async getExperts() {
    return this.expertRepo.find({ relations: ['user'] });
  }

  async validerExpert(id: number) {
    await this.expertRepo.update(id, { valide: true });
    return this.expertRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async refuserExpert(id: number) {
    await this.expertRepo.update(id, { valide: false });
    return this.expertRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async toggleUser(id: number, action: 'activer' | 'desactiver') {
    const isActive = action === 'activer' ? 1 : 0;
    await this.userRepo.update(id, { isActive } as any);
    return this.userRepo.findOne({ where: { id } });
  }

  async deleteUser(id: number) {
    await this.userRepo.delete(id);
    return { message: 'Utilisateur supprimé' };
  }

  async getStartups() {
    return this.startupRepo.find({ relations: ['user'] });
  }

  async validerStartup(id: number) {
    await this.startupRepo.update(id, { valid: true });
    return this.startupRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async getTemoignages() {
    return this.temoignageRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async validerTemoignage(id: number) {
    await this.temoignageRepo.update(id, { statut: 'valide' });
    return this.temoignageRepo.findOne({ where: { id }, relations: ['user'] });
  }

  async deleteTemoignage(id: number) {
    await this.temoignageRepo.delete(id);
    return { message: 'Témoignage supprimé' };
  }
}