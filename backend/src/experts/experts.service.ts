import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Expert } from '../user/expert.entity';
import { User } from '../user/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ExpertsService {
  constructor(
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private mailService: MailService,
  ) {}

  async getMoi(userId: number) {
    const expert = await this.expertRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!expert) return null;
    return {
      ...expert,
      nom: expert.user.nom,
      prenom: expert.user.prenom,
      email: expert.user.email,
      telephone: expert.user.telephone,
      valide: expert.statut === 'valide',
    };
  }

  async getListe() {
    return this.expertRepo.find({
      where: { statut: 'valide' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllForAdmin() {
    return this.expertRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByDomaines(domaines: string[]) {
    if (!domaines || domaines.length === 0) return [];
    return this.expertRepo.find({
      where: {
        domaine: In(domaines),
        statut: 'valide',
      },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateProfil(userId: number, body: any) {
    const expert = await this.expertRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!expert) throw new NotFoundException('Expert non trouvé');

    const modifications = JSON.stringify({
      domaine: body.domaine,
      description: body.description,
      localisation: body.localisation,
      experience: body.experience,
      telephone: body.telephone,
      annee_debut_experience: body.annee_debut_experience,
    });

    await this.expertRepo.update({ user_id: userId }, {
      modifications_en_attente: modifications,
      modification_demandee: true,
    });

    try {
      await this.mailService.sendAdminNotification(
        expert.user.nom,
        'Modification profil expert',
        expert.user.email,
      );
    } catch(e) {
      console.log('Email erreur:', e.message);
    }

    return { message: 'Modification envoyée à l’admin pour validation' };
  }

  async validerModification(expertId: number) {
    const expert = await this.expertRepo.findOne({ where: { id: expertId } });
    if (!expert || !expert.modifications_en_attente) {
      return { message: 'Aucune modification en attente' };
    }

    const modifications = JSON.parse(expert.modifications_en_attente);

    await this.expertRepo.update(expertId, {
      domaine: modifications.domaine,
      description: modifications.description,
      localisation: modifications.localisation,
      experience: modifications.experience,
      annee_debut_experience: modifications.annee_debut_experience,
      modifications_en_attente: '',
      modification_demandee: false,
    });

    if (modifications.telephone) {
      await this.userRepo.update(expert.user_id, {
        telephone: modifications.telephone,
      });
    }

    return { message: 'Modification validée' };
  }

  async refuserModification(expertId: number) {
    await this.expertRepo.update(expertId, {
      modifications_en_attente: '',
      modification_demandee: false,
    });
    return { message: 'Modification refusée' };
  }

  async updatePhoto(userId: number, filename: string) {
    await this.expertRepo.update({ user_id: userId }, { photo: filename });
    return { message: 'Photo mise à jour' };
  }
}