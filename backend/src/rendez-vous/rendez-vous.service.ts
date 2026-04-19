import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rendezvous } from './rendezvous.entity';
import { Expert } from '../user/expert.entity';

@Injectable()
export class RendezVousService {
  constructor(
    @InjectRepository(Rendezvous)
    private rdvRepo: Repository<Rendezvous>,
    @InjectRepository(Expert)
    private expertRepo: Repository<Expert>,
  ) {}

  async createRdv(expert_id: number, client_id: number, date_rdv: string, sujet: string) {
    const rdv = this.rdvRepo.create({
      expert_id,
      client_id,
      date_rdv: new Date(date_rdv),
      statut: 'en_attente',
      sujet,
    });
    return this.rdvRepo.save(rdv);
  }
async deleteRdv(id: number) {
  const result = await this.rdvRepo.delete(id);
  if (result.affected === 0) throw new NotFoundException('Rendez-vous non trouvé');
  return { success: true };
}
  async getById(id: number) {
    return this.rdvRepo.findOne({ where: { id } });
  }

  async updateRdv(id: number, date_rdv: string, sujet: string) {
    await this.rdvRepo.update(id, {
      date_rdv: new Date(date_rdv),
      sujet,
      statut: 'en_attente' // on remet en attente après modification
    });
    return this.rdvRepo.findOne({ where: { id } });
  }

  async getByExpert(userId: number) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) return [];
    return this.rdvRepo.find({
      where: { expert_id: expert.id },
      relations: ['client', 'expert', 'expert.user'],
    });
  }

  async getByClient(client_id: number) {
    return this.rdvRepo.find({
      where: { client_id },
      relations: ['expert', 'expert.user', 'client'],
    });
  }

  async confirmer(id: number) {
    await this.rdvRepo.update(id, { statut: 'confirme' });
    return { message: 'Confirmé' };
  }

  async annuler(id: number) {
    await this.rdvRepo.update(id, { statut: 'annule' });
    return { message: 'Annulé' };
  }
}