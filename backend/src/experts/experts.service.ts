// src/experts/experts.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Expert } from '../user/expert.entity';
import { User } from '../user/user.entity';
import { MailService } from '../mail/mail.service';
import { RequestModificationDto } from './dto/request-modification.dto';
import { UpdateProfilDto } from './dto/update-profil.dto';

@Injectable()
export class ExpertsService {
  private readonly logger = new Logger(ExpertsService.name);

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

  const modifications: any = {};
  if (body.domaine !== undefined && body.domaine !== '') modifications.domaine = body.domaine;
  if (body.description !== undefined) modifications.description = body.description;
  if (body.localisation !== undefined && body.localisation !== '') modifications.localisation = body.localisation;
  if (body.experience !== undefined && body.experience !== '') modifications.experience = body.experience;
  if (body.telephone !== undefined && body.telephone !== '') modifications.telephone = body.telephone;
  if (body.annee_debut_experience !== undefined && body.annee_debut_experience !== '') {
    modifications.annee_debut_experience = String(body.annee_debut_experience);
  }

  if (Object.keys(modifications).length === 0) {
    return { message: 'Aucune modification à enregistrer' };
  }

  await this.expertRepo.update({ user_id: userId }, {
    modifications_en_attente: JSON.stringify(modifications),
    modification_demandee: true,
  });

  this.logger.log(`Expert ${userId} a demandé une modification de profil`);

  try {
    await this.mailService.sendAdminNotification(
      expert.user.nom,
      'Modification profil expert',
      expert.user.email,
    );
  } catch(e) {
    this.logger.error(`Erreur envoi email admin pour expert ${userId}: ${e.message}`);
  }

  return { message: 'Modification envoyée à l’admin pour validation' };
}

  // Validation par l'admin
  async validerModification(expertId: number) {
    const expert = await this.expertRepo.findOne({ where: { id: expertId }, relations: ['user'] });
    if (!expert) throw new NotFoundException(`Expert ${expertId} non trouvé`);
    if (!expert.modifications_en_attente) {
      return { message: 'Aucune modification en attente' };
    }

    const modifications = JSON.parse(expert.modifications_en_attente);

    const expertUpdate: any = {};
    if (modifications.domaine !== undefined) expertUpdate.domaine = modifications.domaine;
    if (modifications.description !== undefined) expertUpdate.description = modifications.description;
    if (modifications.localisation !== undefined) expertUpdate.localisation = modifications.localisation;
    if (modifications.experience !== undefined) expertUpdate.experience = modifications.experience;
    if (modifications.annee_debut_experience !== undefined) {
      const annee = parseInt(modifications.annee_debut_experience, 10);
      if (!isNaN(annee)) expertUpdate.annee_debut_experience = annee;
    }

    await this.expertRepo.update(expertId, {
      ...expertUpdate,
      modifications_en_attente: '',
      modification_demandee: false,
    });

    if (modifications.telephone) {
      await this.userRepo.update(expert.user_id, {
        telephone: modifications.telephone,
      });
    }

    this.logger.log(`Modification validée pour expert ${expertId}`);
    return { message: 'Modification validée' };
  }

  async refuserModification(expertId: number) {
    const expert = await this.expertRepo.findOne({ where: { id: expertId } });
    if (!expert) throw new NotFoundException(`Expert ${expertId} non trouvé`);
    await this.expertRepo.update(expertId, {
      modifications_en_attente: '',
      modification_demandee: false,
    });
    this.logger.log(`Modification refusée pour expert ${expertId}`);
    return { message: 'Modification refusée' };
  }

  // Modification directe par l'admin (avec validation)
  async updateExpertDirectly(expertId: number, dto: UpdateProfilDto) {
    const expert = await this.expertRepo.findOne({ where: { id: expertId }, relations: ['user'] });
    if (!expert) throw new NotFoundException('Expert non trouvé');

    const expertUpdate: any = {};
    if (dto.domaine !== undefined) expertUpdate.domaine = dto.domaine;
    if (dto.description !== undefined) expertUpdate.description = dto.description;
    if (dto.localisation !== undefined) expertUpdate.localisation = dto.localisation;
    if (dto.experience !== undefined) expertUpdate.experience = dto.experience;
    if (dto.annee_debut_experience !== undefined && dto.annee_debut_experience !== null) {
      expertUpdate.annee_debut_experience = dto.annee_debut_experience;
    }

    await this.expertRepo.update(expertId, expertUpdate);

    if (dto.telephone !== undefined && dto.telephone !== '') {
      await this.userRepo.update(expert.user_id, { telephone: dto.telephone });
    }

    // Réinitialiser les demandes de modification
    await this.expertRepo.update(expertId, {
      modifications_en_attente: '',
      modification_demandee: false,
    });

    this.logger.log(`Admin a modifié directement l'expert ${expertId}`);
    return { message: 'Profil mis à jour directement' };
  }

  async updatePhoto(userId: number, filename: string) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) throw new NotFoundException(`Expert pour user ${userId} non trouvé`);
    await this.expertRepo.update({ user_id: userId }, { photo: filename });
    this.logger.log(`Photo mise à jour pour expert ${userId}`);
    return { message: 'Photo mise à jour' };
  }
}