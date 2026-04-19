import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { Startup } from '../user/startup.entity';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';

// Mapping secteur startup -> domaines d'expertise pertinents
const SECTEUR_TO_DOMAINES: Record<string, string[]> = {
  'Technologie': ['Développement Web / Mobile', 'Intelligence Artificielle / Data', 'DevOps', 'Cybersécurité'],
  'Finance': ['Finance / Comptabilité', 'Juridique / Fiscal', 'Data Analyse'],
  'Santé': ['Marketing Digital', 'Data Santé', 'Juridique / Fiscal'],
  'E-commerce': ['Marketing Digital', 'Logistique / Supply Chain', 'Design UI/UX', 'Développement Web / Mobile'],
  'Éducation': ['Marketing Digital', 'Développement Web / Mobile', 'Design UI/UX'],
  'Transport': ['Logistique / Supply Chain', 'Développement Web / Mobile', 'Data Analyse'],
  'Agroalimentaire': ['Marketing Digital', 'Logistique / Supply Chain', 'Juridique / Fiscal'],
};

@Injectable()
export class StartupsService {
  constructor(
    @InjectRepository(Startup) private startupRepo: Repository<Startup>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
  ) {}

  async getMoi(userId: number) {
    console.log(`🔍 Recherche startup pour user_id = ${userId}`);
    let startup = await this.startupRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!startup) {
      console.log(`⚠️ Aucune startup pour user_id ${userId}, recherche d'une startup sans propriétaire...`);
      startup = await this.startupRepo.findOne({
        where: { user_id: IsNull() },
        relations: ['user'],
      });
      if (startup) {
        await this.startupRepo.update(startup.id, { user_id: userId });
        console.log(`✅ Startup "${startup.nom_startup}" attribuée à l'utilisateur ${userId}`);
        startup = await this.startupRepo.findOne({
          where: { id: startup.id },
          relations: ['user'],
        });
      } else {
        console.log(`🆕 Création d'une nouvelle startup pour l'utilisateur ${userId}`);
        const newStartup = this.startupRepo.create({
          nom_startup: `Startup de ${userId}`,
          user_id: userId,
          statut: 'valide',
        });
        startup = await this.startupRepo.save(newStartup);
        startup = await this.startupRepo.findOne({
          where: { id: startup.id },
          relations: ['user'],
        });
      }
    }

    if (!startup) {
      throw new NotFoundException(`Impossible de récupérer ou créer une startup pour l'utilisateur ${userId}`);
    }

    console.log(`✅ Startup trouvée : ID ${startup.id}, nom "${startup.nom_startup}"`);
    return {
      ...startup,
      nom: startup.user?.nom || '',
      prenom: startup.user?.prenom || '',
      email: startup.user?.email || '',
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

  /**
   * Retourne tous les experts validés, triés :
   * - Ceux dont le domaine correspond au secteur de la startup (recommandés) en premier,
   * - Puis tous les autres experts.
   */
  async getRecommendedExperts(userId: number) {
    // 1. Récupérer la startup de l'utilisateur
    const startup = await this.startupRepo.findOne({ where: { user_id: userId } });
    if (!startup || !startup.secteur) {
      // Si pas de startup ou pas de secteur, retourner tous les experts sans tri
      return this.expertRepo.find({
        where: { statut: 'valide' },
        relations: ['user'],
      });
    }

    // 2. Récupérer la liste des domaines recommandés pour ce secteur
    const domainesRecommandes = SECTEUR_TO_DOMAINES[startup.secteur] || [];

    // 3. Récupérer TOUS les experts validés
    const tousLesExperts = await this.expertRepo.find({
      where: { statut: 'valide' },
      relations: ['user'],
    });

    // 4. Trier : recommandés en premier, puis les autres (ordre de création décroissant)
    const expertsTries = tousLesExperts.sort((a, b) => {
      const aMatch = domainesRecommandes.includes(a.domaine);
      const bMatch = domainesRecommandes.includes(b.domaine);
      if (aMatch && !bMatch) return -1; // a recommandé, b non → a avant b
      if (!aMatch && bMatch) return 1;  // b recommandé, a non → b avant a
      // Si tous deux recommandés ou tous deux non recommandés, tri par date décroissante
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return expertsTries;
  }
}