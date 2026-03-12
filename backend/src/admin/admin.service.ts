import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Expert } from '../experts/expert.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Expert)
    private expertRepository: Repository<Expert>,
  ) {}

  async getAllUsers() {
    return this.userRepository.find({ order: { createdAt: 'DESC' } });
  }

  async getAllExperts() {
    return this.expertRepository.find({ order: { createdAt: 'DESC' } });
  }

  async validerExpert(expertId: number) {
    await this.expertRepository.update({ id: expertId }, { valide: true });
    return { message: 'Expert validé ✅' };
  }

  async refuserExpert(expertId: number) {
    await this.expertRepository.update({ id: expertId }, { valide: false });
    return { message: 'Expert refusé ✅' };
  }

  async activerUser(userId: number) {
    await this.userRepository.update({ id: userId }, { isActive: true });
    return { message: 'Utilisateur activé ✅' };
  }

  async desactiverUser(userId: number) {
    await this.userRepository.update({ id: userId }, { isActive: false });
    return { message: 'Utilisateur désactivé ✅' };
  }

  async supprimerUser(userId: number) {
    await this.userRepository.delete({ id: userId });
    return { message: 'Utilisateur supprimé ✅' };
  }

  async getStats() {
    const totalUsers       = await this.userRepository.count();
    const totalExperts     = await this.userRepository.count({ where: { role: 'expert' } });
    const totalStartups    = await this.userRepository.count({ where: { role: 'startup' } });
    const expertsValides   = await this.expertRepository.count({ where: { valide: true } });
    const expertsEnAttente = await this.expertRepository.count({ where: { valide: false } });
    return { totalUsers, totalExperts, totalStartups, expertsValides, expertsEnAttente };
  }
}
