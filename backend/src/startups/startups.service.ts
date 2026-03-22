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
    return this.startupRepo.find({
      where: { valid: true },
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Startup> {
    const s = await this.startupRepo.findOne({
      where: { id },
      relations: ['user'],
    });
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
    console.log('StartupsService.create => userId:', userId, 'data:', data);

    // Utilise QueryBuilder pour éviter les erreurs TypeScript strict
    const result = await this.startupRepo
      .createQueryBuilder()
      .insert()
      .into(Startup)
      .values({
        user_id:     userId,
        nom_startup: data.nom_startup || '',
        secteur:     data.secteur     || '',
        taille:      data.taille      || '',
        fonction:    data.fonction    || '',
        valid:       false,
      } as any)
      .execute();

    const insertedId = result.identifiers[0]?.id;
    const saved = await this.startupRepo.findOne({
      where: { id: insertedId },
      relations: ['user'],
    });

    console.log('Startup créée avec id:', insertedId);
    return saved!;
  }

  async update(id: number, data: any): Promise<Startup> {
    await this.startupRepo.update(id, data as any);
    const updated = await this.startupRepo.findOne({
      where: { id },
      relations: ['user'],
    });
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
      statut:  'en_attente',
    } as any);
    return this.temoignageRepo.save(temo) as any;
  }
}