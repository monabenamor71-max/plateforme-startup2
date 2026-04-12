import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Startup } from '../user/startup.entity';
import { User } from '../user/user.entity';

@Injectable()
export class StartupsService {
  constructor(
    @InjectRepository(Startup) private startupRepo: Repository<Startup>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async getMoi(userId: number) {
    console.log(`🔍 Recherche startup pour user_id = ${userId}`);
    const startup = await this.startupRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!startup) {
      console.warn(`⚠️ Aucune startup trouvée pour user_id ${userId}`);
      return null;
    }
    console.log(`✅ Startup trouvée : ID ${startup.id}, nom "${startup.nom_startup}"`);
    return {
      ...startup,
      nom: startup.user.nom,
      prenom: startup.user.prenom,
      email: startup.user.email,
    };
  }

  async getListe() {
    return this.startupRepo.find({
      where: { statut: 'valide' },
      relations: ['user'],
    });
  }
async updateProfil(userId: number, body: any) {
    const result = await this.startupRepo.update(
      { user_id: userId },
      {
        nom_startup: body.nom_startup,
        secteur: body.secteur,
        taille: body.taille,
        site_web: body.site_web,
        description: body.description,
        fonction: body.fonction,
        localisation: body.localisation,
      }
    );
    console.log(`📝 Mise à jour profil : ${result.affected} ligne(s) modifiée(s) pour user_id ${userId}`);
    return { message: 'Profil mis à jour' };
  }

  async updatePhoto(userId: number, filename: string) {
    await this.startupRepo.update({ user_id: userId }, { photo: filename });
    return { message: 'Photo mise à jour' };
  }
  async getAllStartups() {
  return this.startupRepo.find();
}
async getAllStartupUsers() {
  return this.userRepo.find({ where: { role: 'startup' } });
}
async updateStartupUserId(startupId: number, userId: number) {
  return this.startupRepo.update(startupId, { user_id: userId });
}
}