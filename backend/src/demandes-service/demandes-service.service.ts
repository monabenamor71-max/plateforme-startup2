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
import { FormationsService } from '../formations/formations.service';

export class CreateDemandeDto {
  service?: string;
  description: string;
  delai?: string;
  objectif?: string;
  telephone?: string;
  type_application?: string;
  domaine?: string;
}

export class UpdateDemandeDto {
  service?: string;
  description?: string;
  delai?: string;
  objectif?: string;
  telephone?: string;
  type_application?: string;
  domaine?: string;
}

export class UpdateStatutDto {
  statut: string;
  commentaire?: string;
}

export class NotifierExpertsDto {
  expert_ids: number[];
}

export class AssignerExpertDto {
  expert_id: number;
  commentaire?: string;
}

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
    if (!saved) {
      throw new BadRequestException('Erreur lors de la mise à jour du statut');
    }
    this.logger.log(`Demande ${id} : statut changé à ${dto.statut}`);
    return { message: 'Statut mis à jour' };
  }

  async supprimer(id: number) {
    const demande = await this.repo.findOne({ where: { id } });
    if (!demande) throw new NotFoundException(`Demande ${id} non trouvée`);
    const removeResult = await this.repo.remove(demande);
    if (!removeResult) {
      throw new BadRequestException('Erreur lors de la suppression de la demande');
    }
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
    if (!saved) {
      throw new BadRequestException('Erreur lors de la notification des experts');
    }
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
    if (!saved) {
      throw new BadRequestException('Erreur lors de l’assignation de l’expert');
    }
    this.logger.log(`Expert ${dto.expert_id} assigné à la demande ${demandeId}`);
    return { message: 'Expert assigné avec succès' };
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
        throw new BadRequestException(
          `La formation "${formation.titre}" n'a plus de places disponibles`,
        );
      }
      await this.formationsService.decrementPlaces(formation.id);
      this.logger.log(
        `Places décrementées pour formation ${formation.id} — places restantes : ${formation.places_disponibles - 1}`,
      );
    }

    demande.statut = 'acceptee';
    const saved = await this.repo.save(demande);
    if (!saved) {
      throw new BadRequestException('Erreur lors de l’acceptation de la demande');
    }

    return {
      message: 'Demande acceptée',
      placesRestantes: formation.places_limitees
        ? (formation.places_disponibles ?? 0) - 1
        : null,
    };
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
      this.logger.log(
        `Place restituée pour formation ${demande.formation.id} suite au refus de la demande ${demandeId}`,
      );
    }

    demande.statut = 'refusee';
    const saved = await this.repo.save(demande);
    if (!saved) {
      throw new BadRequestException('Erreur lors du refus de la demande');
    }
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
    if (!saved || !saved.id) {
      throw new BadRequestException('Erreur lors de la création de la demande');
    }
    this.logger.log(`Demande créée par user ${userId}`);
    return saved;
  }

  async createFormationDemande(userId: number, formationId: number) {
    const formation = await this.formationRepo.findOne({
      where: { id: formationId, statut: 'publie' },
    });
    if (!formation) throw new NotFoundException('Formation non trouvée ou non publiée');

    if (formation.places_limitees && (formation.places_disponibles ?? 0) <= 0) {
      throw new BadRequestException(
        `La formation "${formation.titre}" n'a plus de places disponibles`,
      );
    }

    const demandeExistante = await this.repo.findOne({
      where: {
        user_id: userId,
        service: 'formation',
        formation_id: formationId,
      },
    });
    if (demandeExistante) {
      throw new BadRequestException('Vous avez déjà soumis une demande pour cette formation');
    }

    const demande = this.repo.create({
      user_id: userId,
      service: 'formation',
      description: `Demande de participation : ${formation.titre}`,
      formation_id: formation.id,
      statut: 'en_attente',
    });

    const saved = await this.repo.save(demande);
    if (!saved || !saved.id) {
      throw new BadRequestException('Erreur lors de la création de la demande de formation');
    }
    this.logger.log(`Demande de formation créée par user ${userId} pour formation ${formationId}`);
    return saved;
  }

  async updateDemande(id: number, userId: number, dto: UpdateDemandeDto) {
    const demande = await this.repo.findOne({ where: { id, user_id: userId } });
    if (!demande) throw new NotFoundException('Demande non trouvée ou accès non autorisé');
    if (demande.statut !== 'en_attente')
      throw new BadRequestException('Seules les demandes en attente peuvent être modifiées');

    const updateResult = await this.repo.update(id, dto);
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible de mettre à jour la demande');
    }
    this.logger.log(`Demande ${id} mise à jour par user ${userId}`);
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) {
      throw new NotFoundException('Demande non trouvée après mise à jour');
    }
    return updated;
  }

  async deleteDemande(id: number, userId: number) {
    const demande = await this.repo.findOne({ where: { id, user_id: userId } });
    if (!demande) throw new NotFoundException('Demande non trouvée ou accès non autorisé');
    if (demande.statut !== 'en_attente')
      throw new BadRequestException('Seules les demandes en attente peuvent être supprimées');

    const deleteResult = await this.repo.delete(id);
    if (deleteResult.affected === 0) {
      throw new BadRequestException('Impossible de supprimer la demande');
    }
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
    if (!expert) {
      this.logger.warn(`Aucun expert trouvé pour l'utilisateur ${userId}`);
      return [];
    }
    this.logger.log(`Expert trouvé : id=${expert.id}`);

    const demandes = await this.repo.find({
      where: { statut: 'en_attente' },
      relations: ['user', 'formation'],
    });
    this.logger.log(`Nombre de demandes en attente : ${demandes.length}`);

    const notifications = demandes.filter(d => {
      if (!d.experts_notifies) return false;
      let notifies = d.experts_notifies;
      if (typeof notifies === 'string') {
        try { notifies = JSON.parse(notifies); } catch { notifies = []; }
      }
      if (!Array.isArray(notifies)) notifies = [];
      return notifies.includes(expert.id);
    });

    this.logger.log(`Notifications trouvées : ${notifications.length}`);
    return notifications;
  }

  async accepterMission(demandeId: number, userId: number) {
    const expert = await this.getExpertByUserId(userId);
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);
    if (!demande.experts_notifies?.includes(expert.id))
      throw new BadRequestException("Vous n'avez pas été notifié pour cette mission");
    if (demande.expert_assigne_id)
      throw new BadRequestException('Un expert est déjà assigné');

    const acceptes = demande.experts_acceptes || [];
    if (acceptes.includes(expert.id)) return { message: 'Vous avez déjà accepté' };

    demande.experts_acceptes = [...acceptes, expert.id];
    const saved = await this.repo.save(demande);
    if (!saved) {
      throw new BadRequestException('Erreur lors de l’enregistrement de l’acceptation');
    }
    this.logger.log(`Expert ${expert.id} a accepté la mission ${demandeId}`);
    return { message: 'Acceptation enregistrée, en attente de validation admin' };
  }

  async refuserMission(demandeId: number, userId: number) {
    const expert = await this.getExpertByUserId(userId);
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException(`Demande ${demandeId} non trouvée`);
    this.logger.log(`Expert ${expert.id} a refusé la mission ${demandeId}`);
    return { message: 'Refus enregistré' };
  }
}