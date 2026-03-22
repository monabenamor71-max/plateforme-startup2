import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Temoignage } from './temoignage.entity';

@Injectable()
export class TemoignagesService {
  constructor(
    @InjectRepository(Temoignage)
    private repo: Repository<Temoignage>,
  ) {}

  async creer(userId: number, texte: string) {
    const t = this.repo.create({
      user_id: userId,
      texte,
      statut: 'en_attente',
    } as any);
    return this.repo.save(t as any);
  }

  async findAll() {
    return this.repo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findValides() {
    return this.repo.find({
      where: { statut: 'valide' } as any,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async valider(id: number) {
    await this.repo.update(id, { statut: 'valide' });
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }

  async refuser(id: number) {
    await this.repo.update(id, { statut: 'refuse' });
    return this.repo.findOne({ where: { id }, relations: ['user'] });
  }

  async supprimer(id: number) {
    await this.repo.delete(id);
    return { success: true };
  }

  async countEnAttente() {
    return this.repo.count({ where: { statut: 'en_attente' } as any });
  }
}