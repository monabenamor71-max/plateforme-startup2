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
    const startup = await this.startupRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });
    if (!startup) return null;
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
    await this.startupRepo.update({ user_id: userId }, {
      nom_startup: body.nom_startup,
      secteur: body.secteur,
      taille: body.taille,
      site_web: body.site_web,
      description: body.description,
      fonction: body.fonction,
      localisation: body.localisation,
    });
    return { message: 'Profil mis a jour' };
  }

  async updatePhoto(userId: number, filename: string) {
    await this.startupRepo.update({ user_id: userId }, { photo: filename });
    return { message: 'Photo mise a jour' };
  }
}