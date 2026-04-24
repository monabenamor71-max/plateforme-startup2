// src/rendez-vous/rendez-vous.service.ts
import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rendezvous } from './rendezvous.entity';
import { Expert } from '../user/expert.entity';
import { CreateRendezVousDto, UpdateRendezVousDto } from './dto/rendez-vous.dto';

@Injectable()
export class RendezVousService {
  private readonly logger = new Logger(RendezVousService.name);

  constructor(
    @InjectRepository(Rendezvous)
    private rdvRepo: Repository<Rendezvous>,
    @InjectRepository(Expert)
    private expertRepo: Repository<Expert>,
  ) {}

  async createRdv(createDto: CreateRendezVousDto, client_id: number) {
    const { expert_id, date_rdv, sujet } = createDto;
    const expert = await this.expertRepo.findOne({ where: { id: expert_id } });
    if (!expert) throw new NotFoundException(`Expert ${expert_id} introuvable`);

    const rdv = this.rdvRepo.create({
      expert_id,
      client_id,
      date_rdv: new Date(date_rdv),
      statut: 'en_attente',
      sujet,
    });
    const saved = await this.rdvRepo.save(rdv);
    if (!saved || !saved.id) {
      throw new BadRequestException('Erreur lors de la création du rendez-vous');
    }
    this.logger.log(`Rendez-vous créé : ${saved.id}`);
    return saved;
  }

  async deleteRdv(id: number, client_id: number) {
    const rdv = await this.rdvRepo.findOne({ where: { id } });
    if (!rdv) throw new NotFoundException(`Rendez-vous ${id} introuvable`);
    if (rdv.client_id !== client_id) throw new ForbiddenException('Vous ne pouvez supprimer que vos propres rendez-vous');
    if (rdv.statut !== 'en_attente') throw new BadRequestException('Seuls les rendez-vous en attente peuvent être supprimés');

    const result = await this.rdvRepo.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException('Impossible de supprimer le rendez-vous');
    }
    this.logger.log(`Rendez-vous ${id} supprimé`);
    return { success: true };
  }

  async getById(id: number): Promise<Rendezvous | null> {
    return this.rdvRepo.findOne({ where: { id } });
  }

  async updateRdv(id: number, updateDto: UpdateRendezVousDto, client_id: number) {
    const rdv = await this.rdvRepo.findOne({ where: { id } });
    if (!rdv) throw new NotFoundException(`Rendez-vous ${id} introuvable`);
    if (rdv.client_id !== client_id) throw new ForbiddenException('Vous ne pouvez modifier que vos propres rendez-vous');
    if (rdv.statut !== 'en_attente') throw new BadRequestException('Seuls les rendez-vous en attente peuvent être modifiés');

    await this.rdvRepo.update(id, {
      date_rdv: new Date(updateDto.date_rdv),
      sujet: updateDto.sujet,
      statut: 'en_attente',
    });
    const updated = await this.rdvRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException(`Rendez-vous ${id} introuvable après mise à jour`);
    this.logger.log(`Rendez-vous ${id} mis à jour`);
    return updated;
  }

  async getByExpert(userId: number) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) return [];
    return this.rdvRepo.find({
      where: { expert_id: expert.id },
      relations: ['client', 'expert', 'expert.user'],
    });
  }

  async getByClient(client_id: number) {
    return this.rdvRepo.find({
      where: { client_id },
      relations: ['expert', 'expert.user', 'client'],
    });
  }

  async confirmer(id: number) {
    const rdv = await this.rdvRepo.findOne({ where: { id } });
    if (!rdv) throw new NotFoundException(`Rendez-vous ${id} introuvable`);
    const updateResult = await this.rdvRepo.update(id, { statut: 'confirme' });
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible de confirmer le rendez-vous');
    }
    this.logger.log(`Rendez-vous ${id} confirmé`);
    return { message: 'Confirmé' };
  }

  async annuler(id: number) {
    const rdv = await this.rdvRepo.findOne({ where: { id } });
    if (!rdv) throw new NotFoundException(`Rendez-vous ${id} introuvable`);
    const updateResult = await this.rdvRepo.update(id, { statut: 'annule' });
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible d’annuler le rendez-vous');
    }
    this.logger.log(`Rendez-vous ${id} annulé`);
    return { message: 'Annulé' };
  }
}