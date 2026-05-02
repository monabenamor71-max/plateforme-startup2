// src/demandes-service/demandes-service.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DemandeService } from './demande-service.entity';
import { Formation } from '../formations/formation.entity';
import { Expert } from '../user/expert.entity';
import { Devis } from '../devis/devis.entity';
import { FormationsService } from '../formations/formations.service';
import { CreateDemandeDto } from './dto/create-demande.dto';
import { UpdateDemandeDto } from './dto/update-demande.dto';
import { UpdateStatutDto } from './dto/update-statut.dto';
import { NotifierExpertsDto } from './dto/notifier-experts.dto';
import { AssignerExpertDto } from './dto/assigner-expert.dto';

@Injectable()
export class DemandesServiceService {
  private readonly logger = new Logger(DemandesServiceService.name);

  constructor(
    @InjectRepository(DemandeService)
    private repo: Repository<DemandeService>,
    @InjectRepository(Formation)
    private formationRepo: Repository<Formation>,
    @InjectRepository(Expert)
    private expertRepo: Repository<Expert>,
    @InjectRepository(Devis)
    private devisRepo: Repository<Devis>,
    private formationsService: FormationsService,
  ) {}

  // ==================== ADMIN ====================

  async getAll() {
    const demandes = await this.repo.find({
      relations: ['user', 'formation', 'expert_assigne', 'expert_assigne.user'],
      order: { createdAt: 'DESC' },
    });
    return demandes.map(d => ({
      ...d,
      experts_notifies: Array.isArray(d.experts_notifies) ? d.experts_notifies : [],
      experts_acceptes: Array.isArray(d.experts_acceptes) ? d.experts_acceptes : [],
    }));
  }

  async updateStatut(id: number, dto: UpdateStatutDto) {
    const demande = await this.repo.findOne({ where: { id } });
    if (!demande) throw new NotFoundException(`Demande ${id} non trouvée`);
    demande.statut = dto.statut;
    if (dto.commentaire) demande.commentaire_admin = dto.commentaire;
    const saved = await this.repo.save(demande);
    if (!saved) throw new BadRequestException('Erreur lors de la mise à jour du statut');
    this.logger.log(`Demande ${id} : statut changé à ${dto.statut}`);
    return { message: 'Statut mis à jour' };
  }

  async supprimer(id: number) {
    const demande = await this.repo.findOne({ where: { id } });
    if (!demande) throw new NotFoundException(`Demande ${id} non trouvée`);
    await this.repo.remove(demande);
    this.logger.log(`Demande ${id} supprimée`);
    return { message: 'Demande supprimée' };
  }

  async notifierExperts(demandeId: number, dto: NotifierExpertsDto) {
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);

    const actuels = Array.isArray(demande.experts_notifies) ? demande.experts_notifies : [];
    const nouveaux = dto.expert_ids.filter(id => !actuels.includes(id));
    if (nouveaux.length === 0) return { message: 'Aucun nouvel expert à notifier' };

    demande.experts_notifies = [...actuels, ...nouveaux];
    const saved = await this.repo.save(demande);
    if (!saved) throw new BadRequestException('Erreur lors de la notification des experts');
    this.logger.log(`Experts notifiés pour demande ${demandeId} : ${nouveaux.join(',')}`);
    return { message: `${nouveaux.length} expert(s) notifié(s)` };
  }

  async getExpertsAcceptes(demandeId: number) {
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);
    const acceptesIds = demande.experts_acceptes || [];
    if (acceptesIds.length === 0) return [];
    return this.expertRepo.find({ where: { id: In(acceptesIds) }, relations: ['user'] });
  }

  async assignerExpert(demandeId: number, dto: AssignerExpertDto) {
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);

    const acceptes = Array.isArray(demande.experts_acceptes) ? demande.experts_acceptes : [];
    if (!acceptes.includes(dto.expert_id))
      throw new BadRequestException(`L'expert ${dto.expert_id} n'a pas accepté la mission`);
    if (demande.expert_assigne_id)
      throw new BadRequestException('Un expert est déjà assigné');

    demande.expert_assigne_id = dto.expert_id;
    demande.statut = 'acceptee';
    if (dto.commentaire) demande.commentaire_admin = dto.commentaire;
    const saved = await this.repo.save(demande);
    if (!saved) throw new BadRequestException('Erreur lors de l’assignation de l’expert');
    this.logger.log(`Expert ${dto.expert_id} assigné à la demande ${demandeId}`);
    return { message: 'Expert assigné avec succès' };
  }

  async choisirDevis(demandeId: number, devisId: number, expertId: number) {
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);

    const acceptes = Array.isArray(demande.experts_acceptes) ? demande.experts_acceptes : [];
    if (!acceptes.includes(expertId)) {
      throw new BadRequestException("Cet expert n'a pas accepté la mission");
    }

    demande.expert_assigne_id = expertId;
    demande.statut = 'acceptee';
    const saved = await this.repo.save(demande);
    if (!saved) throw new BadRequestException('Erreur lors de l’assignation de l’expert');

    await this.devisRepo.update(devisId, { statut: 'accepte' });

    this.logger.log(`Devis ${devisId} choisi pour demande ${demandeId}, expert ${expertId} assigné`);
    return { message: 'Devis choisi et expert assigné avec succès' };
  }

  // NOUVEAU : Le client choisit directement l'expert et son montant (sans devis préalable)
  async choisirExpert(demandeId: number, expertId: number, montant: number, userId: number) {
    const demande = await this.repo.findOne({
      where: { id: demandeId, user_id: userId },
      relations: ['user'],
    });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée ou accès refusé`);
    if (demande.statut !== 'en_attente')
      throw new BadRequestException('Seules les demandes en attente peuvent être traitées');

    const acceptes = Array.isArray(demande.experts_acceptes) ? demande.experts_acceptes : [];
    if (!acceptes.includes(expertId))
      throw new BadRequestException("Cet expert n'a pas accepté la mission");

    if (demande.expert_assigne_id)
      throw new BadRequestException('Un expert a déjà été choisi pour cette demande');

    demande.expert_assigne_id = expertId;
    demande.devis_montant = montant;
    demande.statut = 'acceptee';
    const saved = await this.repo.save(demande);
    if (!saved) throw new BadRequestException('Erreur lors du choix de l’expert');

    // Optionnel : Créer un devis associé à la demande
    const devis = this.devisRepo.create({
      demande_id: demande.id,
      expert_id: expertId,
      montant: montant,
      description: `Devis pour la mission ${demande.service}`,
      statut: 'accepte',
    });
    await this.devisRepo.save(devis);

    this.logger.log(`Client ${userId} a choisi expert ${expertId} pour demande ${demandeId} au montant ${montant} DT`);
    return { message: 'Expert choisi avec succès, mission acceptée' };
  }

  async acceptFormationDemande(demandeId: number) {
    const demande = await this.repo.findOne({
      where: { id: demandeId, service: 'formation' },
      relations: ['formation'],
    });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);
    if (demande.statut !== 'en_attente')
      throw new BadRequestException('Cette demande a déjà été traitée');

    const formation = demande.formation;
    if (!formation) throw new NotFoundException('Formation associée introuvable');

    if (formation.places_limitees) {
      if ((formation.places_disponibles ?? 0) <= 0) {
        throw new BadRequestException(`La formation "${formation.titre}" n'a plus de places disponibles`);
      }
      await this.formationsService.decrementPlaces(formation.id);
      this.logger.log(`Places décrementées pour formation ${formation.id}`);
    }

    demande.statut = 'acceptee';
    const saved = await this.repo.save(demande);
    if (!saved) throw new BadRequestException('Erreur lors de l’acceptation de la demande');
    return { message: 'Demande acceptée' };
  }

  async rejectFormationDemande(demandeId: number) {
    const demande = await this.repo.findOne({
      where: { id: demandeId, service: 'formation' },
      relations: ['formation'],
    });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);

    const wasAccepted = demande.statut === 'acceptee';
    if (!['en_attente', 'acceptee'].includes(demande.statut))
      throw new BadRequestException('Cette demande ne peut pas être refusée dans son état actuel');

    if (wasAccepted && demande.formation) {
      await this.formationsService.incrementPlaces(demande.formation.id);
      this.logger.log(`Place restituée pour formation ${demande.formation.id}`);
    }

    demande.statut = 'refusee';
    const saved = await this.repo.save(demande);
    if (!saved) throw new BadRequestException('Erreur lors du refus de la demande');
    this.logger.log(`Demande ${demandeId} refusée`);
    return { message: 'Demande refusée' };
  }

  // ==================== STARTUPS ====================

  async getMesDemandes(userId: number) {
    return this.repo.find({
      where: { user_id: userId },
      relations: ['formation', 'expert_assigne', 'expert_assigne.user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(userId: number, dto: CreateDemandeDto) {
    const data = { user_id: userId, ...dto };
    const demande = this.repo.create(data);
    const saved = await this.repo.save(demande);
    if (!saved) throw new BadRequestException('Erreur lors de la création de la demande');
    this.logger.log(`Demande créée par user ${userId}`);
    return saved;
  }

  async createFormationDemande(userId: number, formationId: number) {
    const formation = await this.formationRepo.findOne({
      where: { id: formationId, statut: 'publie' },
    });
    if (!formation) throw new NotFoundException('Formation non trouvée ou non publiée');

    if (formation.places_limitees && (formation.places_disponibles ?? 0) <= 0) {
      throw new BadRequestException(`La formation "${formation.titre}" n'a plus de places disponibles`);
    }

    const demandeExistante = await this.repo.findOne({
      where: { user_id: userId, service: 'formation', formation_id: formationId },
    });
    if (demandeExistante) throw new BadRequestException('Vous avez déjà soumis une demande pour cette formation');

    const demande = this.repo.create({
      user_id: userId,
      service: 'formation',
      description: `Demande de participation : ${formation.titre}`,
      formation_id: formation.id,
      statut: 'en_attente',
    });
    const saved = await this.repo.save(demande);
    if (!saved) throw new BadRequestException('Erreur lors de la création de la demande de formation');
    this.logger.log(`Demande de formation créée par user ${userId} pour formation ${formationId}`);
    return saved;
  }

  async updateDemande(id: number, userId: number, dto: UpdateDemandeDto) {
    const demande = await this.repo.findOne({ where: { id, user_id: userId } });
    if (!demande) throw new NotFoundException('Demande non trouvée ou accès non autorisé');
    if (demande.statut !== 'en_attente')
      throw new BadRequestException('Seules les demandes en attente peuvent être modifiées');

    await this.repo.update(id, dto);
    this.logger.log(`Demande ${id} mise à jour par user ${userId}`);
    return this.repo.findOne({ where: { id } });
  }

  async deleteDemande(id: number, userId: number) {
    const demande = await this.repo.findOne({ where: { id, user_id: userId } });
    if (!demande) throw new NotFoundException('Demande non trouvée ou accès non autorisé');
    if (demande.statut !== 'en_attente')
      throw new BadRequestException('Seules les demandes en attente peuvent être supprimées');

    await this.repo.delete(id);
    this.logger.log(`Demande ${id} supprimée par user ${userId}`);
    return { success: true };
  }

  // ==================== EXPERTS ====================

  private async getExpertByUserId(userId: number): Promise<Expert> {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) throw new NotFoundException('Expert non trouvé pour cet utilisateur');
    return expert;
  }

  async getDemandesAssignees(userId: number) {
    const expert = await this.getExpertByUserId(userId);
    return this.repo.find({
      where: { expert_assigne_id: expert.id },
      relations: ['user', 'formation'],
      order: { createdAt: 'DESC' },
    });
  }

  async getNotificationsForExpert(userId: number) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) return [];
    this.logger.log(`Expert trouvé : id=${expert.id}`);

    const demandes = await this.repo.find({
      where: { statut: 'en_attente' },
      relations: ['user', 'formation'],
    });
    const notifications = demandes.filter(d => {
      const notifies = Array.isArray(d.experts_notifies) ? d.experts_notifies : [];
      return notifies.includes(expert.id);
    });
    this.logger.log(`Notifications trouvées : ${notifications.length}`);
    return notifications;
  }

  async accepterMission(demandeId: number, userId: number) {
    const expert = await this.getExpertByUserId(userId);
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);

    const notifies = Array.isArray(demande.experts_notifies) ? demande.experts_notifies : [];
    if (!notifies.includes(expert.id))
      throw new BadRequestException("Vous n'avez pas été notifié pour cette mission");
    if (demande.expert_assigne_id)
      throw new BadRequestException('Un expert est déjà assigné à cette mission');

    const acceptes = Array.isArray(demande.experts_acceptes) ? demande.experts_acceptes : [];
    if (acceptes.includes(expert.id)) return { message: 'Vous avez déjà accepté' };

    demande.experts_acceptes = [...acceptes, expert.id];
    const saved = await this.repo.save(demande);
    if (!saved) throw new BadRequestException('Erreur lors de l’enregistrement de l’acceptation');
    this.logger.log(`Expert ${expert.id} a accepté la mission ${demandeId}`);
    return { message: 'Acceptation enregistrée, en attente de choix du client' };
  }

  async refuserMission(demandeId: number, userId: number) {
    const expert = await this.getExpertByUserId(userId);
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);
    this.logger.log(`Expert ${expert.id} a refusé la mission ${demandeId}`);
    return { message: 'Refus enregistré' };
  }
}