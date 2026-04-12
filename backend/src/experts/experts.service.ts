import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    });
  }

  // ✅ NOUVELLE MÉTHODE : mise à jour directe de la disponibilité
  async updateDisponibilite(userId: number, disponibilite: string) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) {
      throw new NotFoundException('Expert non trouvé');
    }
    // Mise à jour immédiate, sans validation admin
    await this.expertRepo.update({ user_id: userId }, { disponibilite });
    return { message: 'Disponibilité mise à jour avec succès' };
  }

  async updateProfil(userId: number, body: any) {
    const expert = await this.expertRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!expert) return { message: 'Expert non trouve' };

    // On ne met plus la disponibilité dans les modifications sensibles
    // car elle a son propre endpoint. On ne garde que les champs sensibles.
    const modifications = JSON.stringify({
      domaine: body.domaine,
      description: body.description,
      localisation: body.localisation,
      experience: body.experience,
      // disponibilite: body.disponible ? 'disponible' : 'non disponible', // ← retiré
      telephone: body.telephone,
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
    } catch(e) { console.log('Email erreur:', e.message); }

    return { message: 'Modification envoyee a l admin pour validation' };
  }

  async validerModification(expertId: number) {
    const expert = await this.expertRepo.findOne({ where: { id: expertId } });
    if (!expert || !expert.modifications_en_attente) return { message: 'Aucune modification' };

    const modifications = JSON.parse(expert.modifications_en_attente);

    await this.expertRepo.update(expertId, {
      domaine: modifications.domaine,
      description: modifications.description,
      localisation: modifications.localisation,
      experience: modifications.experience,
      disponibilite: modifications.disponibilite, // si jamais un admin envoie cette clé, mais normalement plus
      modifications_en_attente: '',
      modification_demandee: false,
    });

    if (modifications.telephone) {
      await this.userRepo.update(expert.user_id, {
        telephone: modifications.telephone,
      });
    }

    return { message: 'Modification validee' };
  }

  async refuserModification(expertId: number) {
    await this.expertRepo.update(expertId, {
      modifications_en_attente: '',
      modification_demandee: false,
    });
    return { message: 'Modification refusee' };
  }

  async updatePhoto(userId: number, filename: string) {
    await this.expertRepo.update({ user_id: userId }, { photo: filename });
    return { message: 'Photo mise a jour' };
  }
}