// src/devis/devis.service.ts
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Devis } from './devis.entity';
import { DemandeService } from '../demandes-service/demande-service.entity';
import { Expert } from '../user/expert.entity';

export class CreateDevisDto {
  demande_id: number;
  montant: number;
  description: string;
  delai?: string;
}

export class UpdateStatutDto {
  statut: string;
}

@Injectable()
export class DevisService {
  private readonly logger = new Logger(DevisService.name);

  constructor(
    @InjectRepository(Devis)
    private devisRepo: Repository<Devis>,
    @InjectRepository(DemandeService)
    private demandeRepo: Repository<DemandeService>,
    @InjectRepository(Expert)
    private expertRepo: Repository<Expert>,
  ) {}

  async create(userId: number, dto: CreateDevisDto) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) throw new NotFoundException('Expert non trouvé');

    const demande = await this.demandeRepo.findOne({ where: { id: dto.demande_id } });
    if (!demande) throw new NotFoundException(`Demande ${dto.demande_id} introuvable`);

    if (demande.expert_assigne_id !== expert.id) {
      throw new BadRequestException("Vous n'êtes pas l'expert assigné à cette mission");
    }

    const devis = this.devisRepo.create({
      demande_id: dto.demande_id,
      expert_id: expert.id,
      montant: dto.montant,
      description: dto.description,
      delai: dto.delai,
    });
    const saved = await this.devisRepo.save(devis);
    if (!saved || !saved.id) {
      throw new BadRequestException('Erreur lors de la création du devis');
    }
    this.logger.log(`Devis créé pour demande ${dto.demande_id}`);
    return saved;
  }

  async findByExpert(userId: number) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) {
      this.logger.log(`❌ Aucun expert trouvé pour user_id ${userId}`);
      return [];
    }
    this.logger.log(`✅ Expert trouvé : id=${expert.id}`);

    const devis = await this.devisRepo.find({
      where: { expert_id: expert.id },
      relations: ['demande', 'demande.user'],
      order: { createdAt: 'DESC' },
    });
    this.logger.log(`📋 Nombre de devis trouvés pour expert ${expert.id} : ${devis.length}`);
    return devis;
  }

  async findByClient(userId: number) {
    const demandes = await this.demandeRepo.find({
      where: { user_id: userId },
      select: ['id'],
    });
    const demandeIds = demandes.map(d => d.id);
    if (demandeIds.length === 0) return [];
    return this.devisRepo.find({
      where: { demande_id: In(demandeIds) },
      relations: ['demande', 'expert', 'expert.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.devisRepo.find({
      relations: ['demande', 'demande.user', 'expert', 'expert.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateStatutByClient(devisId: number, userId: number, dto: UpdateStatutDto) {
    const devis = await this.devisRepo.findOne({
      where: { id: devisId },
      relations: ['demande'],
    });
    if (!devis) throw new NotFoundException(`Devis ${devisId} introuvable`);

    if (devis.demande.user_id !== userId) {
      throw new UnauthorizedException("Vous n'êtes pas autorisé à modifier ce devis");
    }

    if (!['accepte', 'refuse'].includes(dto.statut)) {
      throw new BadRequestException('Statut invalide (accepte ou refuse)');
    }

    devis.statut = dto.statut;
    const updated = await this.devisRepo.save(devis);
    if (!updated) {
      throw new BadRequestException('Erreur lors de la mise à jour du statut');
    }
    this.logger.log(`Client ${userId} a ${dto.statut} le devis ${devisId}`);
    return updated;
  }

  async updateStatut(devisId: number, dto: UpdateStatutDto) {
    const devis = await this.devisRepo.findOne({ where: { id: devisId } });
    if (!devis) throw new NotFoundException(`Devis ${devisId} introuvable`);

    devis.statut = dto.statut;
    const updated = await this.devisRepo.save(devis);
    if (!updated) {
      throw new BadRequestException('Erreur lors de la mise à jour du statut');
    }
    this.logger.log(`Admin a changé le statut du devis ${devisId} en ${dto.statut}`);
    return updated;
  }
}