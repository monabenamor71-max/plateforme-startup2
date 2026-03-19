import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Temoignage } from './temoignage.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TemoignagesService {
  constructor(
    @InjectRepository(Temoignage)
    private temoignageRepo: Repository<Temoignage>,
    private usersService: UsersService,
  ) {}

  async create(userId: number, texte: string): Promise<Temoignage> {
    const user = await this.usersService.findOne(userId);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    const temoignage = this.temoignageRepo.create({
      user,
      texte,
      statut: 'en_attente',
    });
    return this.temoignageRepo.save(temoignage);
  }

  async findAll(): Promise<Temoignage[]> {
    return this.temoignageRepo.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Temoignage> {
    const temoignage = await this.temoignageRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!temoignage) throw new NotFoundException('Témoignage non trouvé');
    return temoignage;
  }

  async valider(id: number): Promise<Temoignage> {
    await this.temoignageRepo.update(id, { statut: 'valide' });
    return this.findOne(id);
  }

  async supprimer(id: number): Promise<void> {
    await this.temoignageRepo.delete(id);
  }

  async compterEnAttente(): Promise<number> {
    return this.temoignageRepo.count({ where: { statut: 'en_attente' } });
  }
}