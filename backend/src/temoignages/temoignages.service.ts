import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Temoignage } from './temoignage.entity';

export class CreateTemoignageDto {
  user_id: number;
  texte: string;
}

@Injectable()
export class TemoignagesService {
  private readonly logger = new Logger(TemoignagesService.name);

  constructor(
    @InjectRepository(Temoignage)
    private temoRepo: Repository<Temoignage>,
  ) {}

  async create(createTemoignageDto: CreateTemoignageDto) {
    const { user_id, texte } = createTemoignageDto;
    if (!texte || texte.trim().length === 0) {
      throw new BadRequestException('Le texte du témoignage ne peut pas être vide');
    }
    const t = this.temoRepo.create({ user_id, texte });
    const saved = await this.temoRepo.save(t);
    this.logger.log(`Témoignage créé pour l'utilisateur ${user_id}`);
    return saved;
  }

  async getAll() {
    return this.temoRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getPublics() {
    return this.temoRepo.find({
      where: { statut: 'valide' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMesTemoignages(user_id: number) {
    return this.temoRepo.find({
      where: { user_id },
      order: { createdAt: 'DESC' },
    });
  }

  async valider(id: number) {
    const temoignage = await this.temoRepo.findOne({ where: { id } });
    if (!temoignage) {
      throw new NotFoundException(`Témoignage avec l'ID ${id} introuvable`);
    }
    await this.temoRepo.update(id, { statut: 'valide' });
    this.logger.log(`Témoignage ${id} validé`);
    return { message: 'Témoignage validé' };
  }

  async refuser(id: number) {
    const temoignage = await this.temoRepo.findOne({ where: { id } });
    if (!temoignage) {
      throw new NotFoundException(`Témoignage avec l'ID ${id} introuvable`);
    }
    await this.temoRepo.update(id, { statut: 'refuse' });
    this.logger.log(`Témoignage ${id} refusé`);
    return { message: 'Témoignage refusé' };
  }

  async supprimer(id: number) {
    const temoignage = await this.temoRepo.findOne({ where: { id } });
    if (!temoignage) {
      throw new NotFoundException(`Témoignage avec l'ID ${id} introuvable`);
    }
    await this.temoRepo.delete(id);
    this.logger.log(`Témoignage ${id} supprimé`);
    return { message: 'Témoignage supprimé' };
  }
}