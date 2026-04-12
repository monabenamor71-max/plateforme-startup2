import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DemandeService } from './demande-service.entity';
import { Formation } from '../formations/formation.entity';
import { Expert } from '../user/expert.entity';

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
  ) {}

  async create(data: Partial<DemandeService>) {
    const demande = this.repo.create(data);
    return this.repo.save(demande);
  }

  async getAll() {
    try {
      const demandes = await this.repo.find({
        relations: ['user', 'formation', 'expert_assigne', 'expert_assigne.user'],
        order: { createdAt: 'DESC' },
      });
      // Nettoyage des champs JSON (au cas où ils seraient null)
      return demandes.map(d => ({
        ...d,
        experts_notifies: Array.isArray(d.experts_notifies) ? d.experts_notifies : [],
        experts_acceptes: Array.isArray(d.experts_acceptes) ? d.experts_acceptes : [],
      }));
    } catch (error) {
      this.logger.error('Erreur dans getAll()', error);
      throw new Error('Impossible de récupérer les demandes');
    }
  }

  async getMesDemandes(userId: number) {
    return this.repo.find({
      where: { user_id: userId },
      relations: ['formation'],
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['formation', 'user'] });
  }

  async updateStatut(id: number, statut: string, commentaire?: string) {
    await this.repo.update(id, { statut, commentaire_admin: commentaire });
    return this.repo.findOne({ where: { id } });
  }

  async supprimer(id: number) {
    await this.repo.delete(id);
    return { success: true };
  }

  async createFormationDemande(userId: number, formationId: number) {
    const formation = await this.formationRepo.findOne({ where: { id: formationId, statut: 'publie' } });
    if (!formation) throw new NotFoundException('Formation non trouvée');
    if (formation.places_limitees && formation.places_disponibles <= 0)
      throw new BadRequestException("Plus de places disponibles");
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
    const demande = await this.repo.findOne({ where: { id: demandeId, service: 'formation' }, relations: ['formation'] });
    if (!demande) throw new NotFoundException('Demande non trouvée');
    if (demande.statut !== 'en_attente') throw new BadRequestException('Déjà traitée');
    const formation = demande.formation;
    if (formation.places_limitees) {
      if (formation.places_disponibles <= 0) throw new BadRequestException('Plus de places disponibles');
      formation.places_disponibles -= 1;
      await this.formationRepo.save(formation);
    }
    demande.statut = 'acceptee';
    return this.repo.save(demande);
  }

  async rejectFormationDemande(demandeId: number) {
    const demande = await this.repo.findOne({ where: { id: demandeId, service: 'formation' } });
    if (!demande) throw new NotFoundException('Demande non trouvée');
    if (demande.statut !== 'en_attente') throw new BadRequestException('Déjà traitée');
    demande.statut = 'refusee';
    return this.repo.save(demande);
  }

  // --- NOTIFICATIONS ET ASSIGNATION ---

  async notifierExperts(demandeId: number, expertIds: number[]) {
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException('Demande non trouvée');
    const actuels = Array.isArray(demande.experts_notifies) ? demande.experts_notifies : [];
    const nouveaux = expertIds.filter(id => !actuels.includes(id));
    if (nouveaux.length === 0) return { message: 'Aucun nouvel expert à notifier' };
    demande.experts_notifies = [...actuels, ...nouveaux];
    await this.repo.save(demande);
    this.logger.log(`Experts notifiés pour demande ${demandeId} : ${nouveaux.join(',')}`);
    return { message: `${nouveaux.length} expert(s) notifié(s)` };
  }

  async getExpertsAcceptes(demandeId: number) {
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException('Demande non trouvée');
    const acceptesIds = demande.experts_acceptes || [];
    if (acceptesIds.length === 0) return [];
    const experts = await this.expertRepo.find({ where: { id: In(acceptesIds) }, relations: ['user'] });
    return experts;
  }

  async assignerExpert(demandeId: number, expertId: number, commentaire?: string) {
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException('Demande non trouvée');
    const acceptes = Array.isArray(demande.experts_acceptes) ? demande.experts_acceptes : [];
    if (!acceptes.includes(expertId))
      throw new BadRequestException(`L'expert ${expertId} n'a pas accepté la mission (acceptés: ${JSON.stringify(acceptes)})`);
    if (demande.expert_assigne_id) throw new BadRequestException('Un expert est déjà assigné');
    demande.expert_assigne_id = expertId;
    demande.statut = 'acceptee';
    if (commentaire) demande.commentaire_admin = commentaire;
    await this.repo.save(demande);
    return { message: 'Expert assigné avec succès' };
  }

  async getDemandesAssignees(expertId: number) {
    return this.repo.find({
      where: { expert_assigne_id: expertId },
      relations: ['user', 'formation'],
      order: { createdAt: 'DESC' },
    });
  }

  async getNotificationsForExpert(expertId: number) {
    const demandes = await this.repo.find({
      where: { statut: 'en_attente' },
      relations: ['user', 'formation'],
      order: { createdAt: 'DESC' },
    });
    return demandes.filter(d => {
      const notifies = Array.isArray(d.experts_notifies) ? d.experts_notifies : [];
      return notifies.includes(expertId);
    });
  }

  async accepterMission(demandeId: number, expertId: number) {
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException('Demande non trouvée');
    if (!demande.experts_notifies?.includes(expertId))
      throw new BadRequestException("Vous n'avez pas été notifié pour cette mission");
    if (demande.expert_assigne_id)
      throw new BadRequestException('Un expert est déjà assigné');
    const acceptes = demande.experts_acceptes || [];
    if (acceptes.includes(expertId)) return { message: 'Vous avez déjà accepté' };
    demande.experts_acceptes = [...acceptes, expertId];
    await this.repo.save(demande);
    return { message: 'Acceptation enregistrée, en attente de validation admin' };
  }

  async refuserMission(demandeId: number, expertId: number) {
    const demande = await this.repo.findOne({ where: { id: demandeId } });
    if (!demande) throw new NotFoundException('Demande non trouvée');
    // Optionnel : enregistrer le refus
    return { message: 'Refus enregistré' };
  }
}