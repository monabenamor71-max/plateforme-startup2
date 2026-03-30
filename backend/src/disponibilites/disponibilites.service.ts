import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disponibilite } from './disponibilite.entity';

@Injectable()
export class DisponibilitesService {
  constructor(
    @InjectRepository(Disponibilite)
    private dispoRepo: Repository<Disponibilite>,
  ) {}

  async create(expert_id: number, date: string, heureDebut: string, heureFin: string) {
    const dispo = this.dispoRepo.create({ expert_id, date, heureDebut, heureFin });
    return this.dispoRepo.save(dispo);
  }

  async getByExpert(expert_id: number) {
    return this.dispoRepo.find({ where: { expert_id } });
  }

  async delete(id: number) {
    await this.dispoRepo.delete(id);
    return { message: 'Supprimé' };
  }
}