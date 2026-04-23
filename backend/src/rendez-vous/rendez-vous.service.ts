import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rendezvous } from './rendezvous.entity';
import { Expert } from '../user/expert.entity';
import { CreateRendezVousDto, UpdateRendezVousDto } from './dto/rendez-vous.dto';

@Injectable()
export class RendezVousService {
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
    return this.rdvRepo.save(rdv);
  }

  async deleteRdv(id: number, client_id: number) {
    const rdv = await this.rdvRepo.findOne({ where: { id } });
    if (!rdv) throw new NotFoundException(`Rendez-vous ${id} introuvable`);
    if (rdv.client_id !== client_id) throw new ForbiddenException('Vous ne pouvez supprimer que vos propres rendez-vous');
    if (rdv.statut !== 'en_attente') throw new BadRequestException('Seuls les rendez-vous en attente peuvent être supprimés');

    const result = await this.rdvRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Rendez-vous non trouvé');
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
    return this.rdvRepo.findOne({ where: { id } });
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
    await this.rdvRepo.update(id, { statut: 'confirme' });
    return { message: 'Confirmé' };
  }

  async annuler(id: number) {
    const rdv = await this.rdvRepo.findOne({ where: { id } });
    if (!rdv) throw new NotFoundException(`Rendez-vous ${id} introuvable`);
    await this.rdvRepo.update(id, { statut: 'annule' });
    return { message: 'Annulé' };
  }
}