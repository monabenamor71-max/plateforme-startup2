import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disponibilite } from './disponibilite.entity';
import { ExpertsService } from '../experts/experts.service';

@Injectable()
export class DisponibilitesService {
  constructor(
    @InjectRepository(Disponibilite)
    private dispoRepo: Repository<Disponibilite>,
    private expertsService: ExpertsService,
  ) {}

  async create(createDispoDto: any): Promise<Disponibilite> {
    const expert = await this.expertsService.findOne(createDispoDto.expertId);
    if (!expert) throw new NotFoundException('Expert non trouvé');
    const dispo = this.dispoRepo.create({ ...createDispoDto, expert });
    // Sauvegarde retourne une seule entité car l'input est une entité unique
    return this.dispoRepo.save(dispo) as unknown as Promise<Disponibilite>;
  }

  async findByExpert(expertId: number): Promise<Disponibilite[]> {
    return this.dispoRepo.find({
      where: { expert: { id: expertId }, disponible: true },
      order: { date: 'ASC', heure: 'ASC' },
    });
  }

  async update(id: number, data: Partial<Disponibilite>): Promise<Disponibilite> {
    await this.dispoRepo.update(id, data);
    const updated = await this.dispoRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('Disponibilité non trouvée');
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.dispoRepo.delete(id);
  }
}
