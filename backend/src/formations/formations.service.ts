// src/formations/formations.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Formation } from './formation.entity';

@Injectable()
export class FormationsService {
  constructor(
    @InjectRepository(Formation)
    private formationRepo: Repository<Formation>,
  ) {}

  // ==================== EXPERTS ====================
  async createFromExpert(data: any, imageFile: any, expertId: number) {
    const enLigne = data.en_ligne === 'true' || data.en_ligne === true;
    const gratuit = data.gratuit === 'true' || data.gratuit === true;
    const certifiante = data.certifiante === 'true' || data.certifiante === true;
    const placesLimitees = data.places_limitees === 'true' || data.places_limitees === true;
    let placesDisponibles = 0;
    if (placesLimitees && data.places_disponibles) {
      placesDisponibles = parseInt(data.places_disponibles, 10) || 0;
    }

    const formation = this.formationRepo.create({
      titre: data.titre,
      description: data.description,
      duree: data.duree || null,
      localisation: data.localisation || null,
      mode: enLigne ? 'en_ligne' : 'presentiel',
      lien_formation: data.lien_formation || null,
      formateur: data.nom_formateur || null,
      places_limitees: placesLimitees,
      places_disponibles: placesDisponibles,
      prix: data.prix ? parseInt(data.prix, 10) : 0,
      gratuit: gratuit,
      certifiante: certifiante,
      dateDebut: data.dateDebut ? new Date(data.dateDebut) : undefined,
      dateFin: data.dateFin ? new Date(data.dateFin) : undefined,
      domaine: data.domaine || null,
      type: data.type || 'formation',
      image: imageFile?.filename || null,
      statut: 'en_attente',
      expertId: expertId,
    });

    return await this.formationRepo.save(formation);
  }

  async findByExpert(expertId: number) {
    return this.formationRepo.find({
      where: { expertId },
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== ADMIN ====================
  async create(data: any, imageFile: any) {
    const formation = this.formationRepo.create({
      ...data,
      image: imageFile?.filename || null,
      statut: 'brouillon',
    });
    return await this.formationRepo.save(formation);
  }

  async findAll() {
    return this.formationRepo.find({ order: { createdAt: 'DESC' } });
  }

  async update(id: number, data: any, imageFile: any) {
    const formation = await this.findOne(id);
    if (imageFile) data.image = imageFile.filename;
    Object.assign(formation, data);
    return await this.formationRepo.save(formation);
  }

  async updateStatut(id: number, statut: string, commentaire?: string) {
    const formation = await this.findOne(id);
    formation.statut = statut;
    if (commentaire) formation.commentaire_admin = commentaire;
    return await this.formationRepo.save(formation);
  }

  async delete(id: number) {
    const formation = await this.findOne(id);
    return await this.formationRepo.remove(formation);
  }

  async decrementPlaces(formationId: number): Promise<void> {
    const formation = await this.findOne(formationId);
    if (formation.places_limitees && formation.places_disponibles > 0) {
      formation.places_disponibles -= 1;
      await this.formationRepo.save(formation);
    }
  }

  // ==================== PUBLIQUES ====================
  async findPublished() {
    return this.formationRepo.find({
      where: { statut: 'publie' },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const formation = await this.formationRepo.findOne({ where: { id } });
    if (!formation) throw new NotFoundException('Formation non trouvée');
    return formation;
  }
}