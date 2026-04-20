// src/formations/formations.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
    const enLigne       = data.en_ligne === 'true'        || data.en_ligne === true;
    const gratuit       = data.gratuit === 'true'         || data.gratuit === true;
    const certifiante   = data.certifiante === 'true'     || data.certifiante === true;
    const placesLimitees = data.places_limitees === 'true' || data.places_limitees === true;

    let placesDisponibles = 0;
    if (placesLimitees && data.places_disponibles) {
      placesDisponibles = parseInt(data.places_disponibles, 10) || 0;
    }

    const formation = this.formationRepo.create({
      titre:             data.titre,
      description:       data.description,
      duree:             data.duree             || null,
      localisation:      data.localisation      || null,
      mode:              enLigne ? 'en_ligne' : 'presentiel',
      lien_formation:    data.lien_formation    || null,
      formateur:         data.nom_formateur     || null,
      places_limitees:   placesLimitees,
      places_disponibles: placesDisponibles,
      prix:              data.prix ? parseInt(data.prix, 10) : 0,
      gratuit,
      certifiante,
      dateDebut:         data.dateDebut ? new Date(data.dateDebut) : undefined,
      dateFin:           data.dateFin   ? new Date(data.dateFin)   : undefined,
      domaine:           data.domaine   || null,
      type:              data.type      || 'formation',
      image:             imageFile?.filename || null,
      statut:            'en_attente',
      expertId,
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
    const places_limitees  = data.places_limitees === 'true' || data.places_limitees === true;
    const certifiante      = data.certifiante === 'true'     || data.certifiante === true;
    const a_la_une         = data.a_la_une === 'true'        || data.a_la_une === true;
    const gratuit          = data.gratuit === 'true'         || data.gratuit === true;

    const formation = this.formationRepo.create({
      ...data,
      places_limitees,
      certifiante,
      a_la_une,
      gratuit,
      places_disponibles: places_limitees && data.places_disponibles
        ? parseInt(data.places_disponibles, 10)
        : null,
      prix: data.prix ? parseInt(data.prix, 10) : null,
      image:  imageFile?.filename || null,
      statut: data.statut || 'brouillon',
    });

    return await this.formationRepo.save(formation);
  }

  async findAll() {
    return this.formationRepo.find({ order: { createdAt: 'DESC' } });
  }

  async update(id: number, data: any, imageFile: any) {
    const formation = await this.findOne(id);

    // Conversion des booléens depuis FormData (strings)
    if (data.places_limitees !== undefined) data.places_limitees = data.places_limitees === 'true' || data.places_limitees === true;
    if (data.certifiante !== undefined)     data.certifiante     = data.certifiante === 'true'     || data.certifiante === true;
    if (data.a_la_une !== undefined)        data.a_la_une        = data.a_la_une === 'true'        || data.a_la_une === true;
    if (data.gratuit !== undefined)         data.gratuit         = data.gratuit === 'true'         || data.gratuit === true;
    if (data.prix)                          data.prix            = parseInt(data.prix, 10);
    if (data.places_disponibles)            data.places_disponibles = parseInt(data.places_disponibles, 10);
    if (imageFile)                          data.image           = imageFile.filename;

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

  /**
   * Décrémente les places disponibles d'1 unité.
   * Appelé par DemandesServiceService.acceptFormationDemande().
   */
  async decrementPlaces(formationId: number): Promise<void> {
    const formation = await this.findOne(formationId);
    if (formation.places_limitees) {
      if (formation.places_disponibles <= 0) {
        throw new BadRequestException('Plus de places disponibles pour cette formation');
      }
      formation.places_disponibles -= 1;
      await this.formationRepo.save(formation);
    }
  }

  /**
   * Réincrémente les places disponibles d'1 unité.
   * Appelé en cas de refus d'une demande déjà acceptée.
   */
async incrementPlaces(formationId: number): Promise<void> {
  const formation = await this.formationRepo.findOne({ where: { id: formationId } });
  if (!formation) throw new NotFoundException('Formation non trouvée');
  if (formation.places_limitees) {
    formation.places_disponibles = (formation.places_disponibles || 0) + 1;
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

  async findOne(id: number): Promise<Formation> {
    const formation = await this.formationRepo.findOne({ where: { id } });
    if (!formation) throw new NotFoundException('Formation non trouvée');
    return formation;
  }
}