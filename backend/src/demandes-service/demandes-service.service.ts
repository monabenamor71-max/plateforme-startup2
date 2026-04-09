import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DemandeService } from './demande-service.entity';
import { Formation } from '../formations/formation.entity';

@Injectable()
export class DemandesServiceService {
  constructor(
    @InjectRepository(DemandeService)
    private repo: Repository<DemandeService>,
    @InjectRepository(Formation)
    private formationRepo: Repository<Formation>,
  ) {}

  async create(data: Partial<DemandeService>) {
    const demande = this.repo.create(data);
    return this.repo.save(demande);
  }

  async getAll() {
    return this.repo.find({
      relations: ['user', 'formation', 'expert_assigne'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMesDemandes(userId: number) {
    return this.repo.find({
      where: { user_id: userId },
      relations: ['formation'],
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['formation'] });
  }

  async updateStatut(id: number, statut: string, commentaire?: string) {
    await this.repo.update(id, { statut, commentaire_admin: commentaire });
    return this.repo.findOne({ where: { id } });
  }

  async envoyerAuxExperts(id: number) {
    await this.repo.update(id, { statut: 'envoye_aux_experts' });
    return this.repo.findOne({ where: { id } });
  }

  async terminerMission(id: number) {
    await this.repo.update(id, { statut: 'terminee' });
    return this.repo.findOne({ where: { id } });
  }

  async supprimer(id: number) {
    await this.repo.delete(id);
    return { success: true };
  }

  async createFormationDemande(userId: number, formationId: number) {
    const formation = await this.formationRepo.findOne({
      where: { id: formationId, statut: 'publie' }
    });
    if (!formation) {
      throw new NotFoundException('Formation non trouvée ou non publiée');
    }
    if (formation.places_limitees && formation.places_disponibles <= 0) {
      throw new BadRequestException("Cette formation n'a plus de places disponibles");
    }
    const demande = this.repo.create({
      user_id: userId,
      service: 'formation',
      description: `Demande de formation : ${formation.titre}`,
      formation_id: formation.id,
      statut: 'en_attente'
    });
    return this.repo.save(demande);
  }

  async acceptFormationDemande(demandeId: number) {
  const demande = await this.repo.findOne({
    where: { id: demandeId, service: 'formation' },
    relations: ['formation']   // crucial pour récupérer l'objet formation
  });
  if (!demande) throw new NotFoundException('Demande non trouvée');
  if (demande.statut !== 'en_attente') throw new BadRequestException('Déjà traitée');
  const formation = demande.formation;
  if (!formation) throw new NotFoundException('Formation associée introuvable');
  if (formation.places_limitees) {
    if (formation.places_disponibles <= 0) {
      throw new BadRequestException('Plus de places disponibles');
    }
    formation.places_disponibles -= 1;
    await this.formationRepo.save(formation);
  }
  demande.statut = 'acceptee';
  return this.repo.save(demande);
}
  async rejectFormationDemande(demandeId: number) {
    const demande = await this.repo.findOne({
      where: { id: demandeId, service: 'formation' }
    });
    if (!demande) {
      throw new NotFoundException('Demande de formation non trouvée');
    }
    if (demande.statut !== 'en_attente') {
      throw new BadRequestException('Cette demande a déjà été traitée');
    }
    demande.statut = 'refusee';
    return this.repo.save(demande);
  }
  
}