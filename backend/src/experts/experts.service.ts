import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Expert } from '../user/expert.entity';
import { User } from '../user/user.entity';
import { MailService } from '../mail/mail.service';
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

  async updateProfil(userId: number, dto: UpdateProfilDto) {
    const expert = await this.expertRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!expert) throw new NotFoundException('Expert non trouvé');

    const modifications = JSON.stringify({
      domaine: dto.domaine,
      description: dto.description,
      localisation: dto.localisation,
      experience: dto.experience,
      telephone: dto.telephone,
      annee_debut_experience: dto.annee_debut_experience,
    });

    await this.expertRepo.update({ user_id: userId }, {
      modifications_en_attente: modifications,
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

  async validerModification(expertId: number) {
    const expert = await this.expertRepo.findOne({ where: { id: expertId } });
    if (!expert) throw new NotFoundException(`Expert ${expertId} non trouvé`);
    if (!expert.modifications_en_attente) {
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

  async updatePhoto(userId: number, filename: string) {
    const expert = await this.expertRepo.findOne({ where: { user_id: userId } });
    if (!expert) throw new NotFoundException(`Expert pour user ${userId} non trouvé`);
    await this.expertRepo.update({ user_id: userId }, { photo: filename });
    this.logger.log(`Photo mise à jour pour expert ${userId}`);
    return { message: 'Photo mise à jour' };
  }
}