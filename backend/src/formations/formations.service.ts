import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Formation } from './formation.entity';

@Injectable()
export class FormationsService {
  constructor(
    @InjectRepository(Formation)
    private formationRepo: Repository<Formation>,
  ) {}

  async create(data: any, imageFile?: any) {
    const formation = this.formationRepo.create({
      ...data,
      image: imageFile?.filename || null,
    });
    return await this.formationRepo.save(formation);
  }

  async findAll() {
    return await this.formationRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findPublished() {
    return await this.formationRepo.find({
      where: { statut: 'publie' },
      order: { createdAt: 'DESC' },
    });
  }

  // ⚠️ Ces deux méthodes doivent être SUPPRIMÉES
  // async findFormations() { ... }
  // async findPodcasts() { ... }

  async findOne(id: number) {
    const formation = await this.formationRepo.findOne({ where: { id } });
    if (!formation) throw new NotFoundException('Formation non trouvée');
    return formation;
  }

  async update(id: number, data: any, imageFile?: any) {
    const formation = await this.findOne(id);
    if (imageFile) data.image = imageFile.filename;
    Object.assign(formation, data);
    return await this.formationRepo.save(formation);
  }

  async updateStatut(id: number, statut: string) {
    const formation = await this.findOne(id);
    formation.statut = statut;
    return await this.formationRepo.save(formation);
  }

  async delete(id: number) {
    const formation = await this.findOne(id);
    return await this.formationRepo.remove(formation);
  }
}