// src/devis/devis.service.ts
import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Devis } from './devis.entity';
import { DemandeService } from '../demandes-service/demande-service.entity';
import { Expert } from '../user/expert.entity';

@Injectable()
export class DevisService {
  constructor(
    @InjectRepository(Devis)
    private devisRepo: Repository<Devis>,
    @InjectRepository(DemandeService)
    private demandeRepo: Repository<DemandeService>,
    @InjectRepository(Expert)
    private expertRepo: Repository<Expert>,
  ) {}

  // ⚠️ Cette méthode accepte deux arguments : userId et data
  async create(userId: number, data: { demande_id: number; montant: number; description: string; delai?: string }) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) throw new NotFoundException('Expert non trouvé pour cet utilisateur');

    const demande = await this.demandeRepo.findOne({ where: { id: data.demande_id } });
    if (!demande) throw new NotFoundException('Demande introuvable');
    if (demande.expert_assigne_id !== expert.id) {
      throw new BadRequestException('Vous n\'êtes pas l\'expert assigné à cette mission');
    }

    const devis = this.devisRepo.create({
      demande_id: data.demande_id,
      expert_id: expert.id,
      montant: data.montant,
      description: data.description,
      delai: data.delai,
    });
    return this.devisRepo.save(devis);
  }

  // Expert : voir ses devis
  async findByExpert(userId: number) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) return [];
    return this.devisRepo.find({
      where: { expert_id: expert.id },
      relations: ['demande', 'demande.user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Client : voir ses devis reçus
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

  // Admin : voir tous les devis
  async findAll() {
    return this.devisRepo.find({
      relations: ['demande', 'demande.user', 'expert', 'expert.user'],
      order: { createdAt: 'DESC' },
    });
  }

  // Client : accepter/refuser un devis
  async updateStatutByClient(devisId: number, userId: number, statut: string) {
    const devis = await this.devisRepo.findOne({ where: { id: devisId }, relations: ['demande'] });
    if (!devis) throw new NotFoundException('Devis introuvable');
    if (devis.demande.user_id !== userId) {
      throw new UnauthorizedException('Vous n\'êtes pas autorisé à modifier ce devis');
    }
    if (statut !== 'accepte' && statut !== 'refuse') {
      throw new BadRequestException('Statut invalide');
    }
    devis.statut = statut;
    return this.devisRepo.save(devis);
  }

  // Admin : changer statut
  async updateStatut(id: number, statut: string) {
    const devis = await this.devisRepo.findOne({ where: { id } });
    if (!devis) throw new NotFoundException('Devis introuvable');
    devis.statut = statut;
    return this.devisRepo.save(devis);
  }
}