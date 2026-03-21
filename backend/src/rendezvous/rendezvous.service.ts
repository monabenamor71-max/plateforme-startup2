import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rendezvous } from './rendezvous.entity';
@Injectable()
export class RendezvousService {
  constructor(
    @InjectRepository(Rendezvous)
    private rdvRepo: Repository<Rendezvous>,
  ) {}
  async creer(startupUserId: number, expertId: number, data: { date_rdv: string; heure: string; motif: string }) {
    const rdv = this.rdvRepo.create({ startup_id: startupUserId, expert_id: expertId, date_rdv: data.date_rdv, heure: data.heure, motif: data.motif, statut: 'en_attente' } as any);
    return this.rdvRepo.save(rdv as any);
  }
  async getMesRdvStartup(userId: number) {
    return this.rdvRepo.find({ where: { startup_id: userId } as any, relations: ['expert', 'expert.user', 'client'], order: { createdAt: 'DESC' } });
  }
  async getMesRdvExpert(expertId: number) {
    return this.rdvRepo.find({ where: { expert_id: expertId } as any, relations: ['client', 'expert'], order: { createdAt: 'DESC' } });
  }
  async confirmer(id: number) {
    await this.rdvRepo.update(id, { statut: 'confirme' });
    return this.rdvRepo.findOne({ where: { id }, relations: ['client', 'expert'] });
  }
  async annuler(id: number) {
    await this.rdvRepo.update(id, { statut: 'annule' });
    return this.rdvRepo.findOne({ where: { id }, relations: ['client', 'expert'] });
  }
}