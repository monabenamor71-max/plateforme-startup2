import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Startup } from './startup.entity';
import { Temoignage } from '../temoignages/temoignage.entity';

@Injectable()
export class StartupsService {
  constructor(
    @InjectRepository(Startup)
    private startupRepo: Repository<Startup>,
    @InjectRepository(Temoignage)
    private temoignageRepo: Repository<Temoignage>,
  ) {}

  async findAll(): Promise<Startup[]> {
    return this.startupRepo.find({ relations: ['user'] });
  }

  async findAllValidated(): Promise<Startup[]> {
    return this.startupRepo.find({ where: { valid: true }, relations: ['user'] });
  }

  async findOne(id: number): Promise<Startup> {
    const s = await this.startupRepo.findOne({ where: { id }, relations: ['user'] });
    if (!s) throw new NotFoundException('Startup non trouvée');
    return s;
  }

  async findByUser(userId: number): Promise<Startup | null> {
    return this.startupRepo.findOne({
      where: { user_id: userId } as any,
      relations: ['user'],
    });
  }

  async create(userId: number, data: any): Promise<Startup> {
    const startup = this.startupRepo.create({ user_id: userId, ...data } as any);
    return this.startupRepo.save(startup) as any;
  }

  async update(id: number, data: any): Promise<Startup> {
    await this.startupRepo.update(id, data);
    const updated = await this.startupRepo.findOne({ where: { id }, relations: ['user'] });
    if (!updated) throw new NotFoundException('Startup non trouvée');
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.startupRepo.delete(id);
  }

  async envoyerTemoignage(userId: number, texte: string): Promise<Temoignage> {
    const temo = this.temoignageRepo.create({
      user_id: userId,
      texte,
      statut: 'en_attente',
    } as any);
    return this.temoignageRepo.save(temo) as any;
  }
}