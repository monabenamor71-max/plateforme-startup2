import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Formation } from './formation.entity';

// DTO définis directement dans le service
export class CreateFormationDto {
  titre: string;
  description?: string;
  domaine?: string;
  formateur?: string;
  type?: string;
  prix?: number;
  places_limitees?: boolean;
  places_disponibles?: number;
  duree?: string;
  mode?: string;
  localisation?: string;
  certifiante?: boolean;
  a_la_une?: boolean;
  dateDebut?: string;
  dateFin?: string;
  lien_formation?: string;
  gratuit?: boolean;
  niveau?: string;
  categorie?: string;
  statut?: string;
}

export class UpdateFormationDto {
  titre?: string;
  description?: string;
  domaine?: string;
  formateur?: string;
  type?: string;
  prix?: number;
  places_limitees?: boolean;
  places_disponibles?: number;
  duree?: string;
  mode?: string;
  localisation?: string;
  certifiante?: boolean;
  a_la_une?: boolean;
  dateDebut?: string;
  dateFin?: string;
  lien_formation?: string;
  gratuit?: boolean;
  niveau?: string;
  categorie?: string;
  statut?: string;
  image?: string;
}

export class UpdateStatutDto {
  statut: string;
  commentaire?: string;
}

@Injectable()
export class FormationsService {
  private readonly logger = new Logger(FormationsService.name);

  constructor(
    @InjectRepository(Formation)
    private formationRepo: Repository<Formation>,
  ) {}

  private async findOneOrFail(id: number): Promise<Formation> {
    const formation = await this.formationRepo.findOne({ where: { id } });
    if (!formation) throw new NotFoundException(`Formation ${id} non trouvée`);
    return formation;
  }

  // ==================== EXPERTS ====================

  async createFromExpert(dto: CreateFormationDto, imageFile: Express.Multer.File | undefined, expertId: number): Promise<Formation> {
    const formation = this.formationRepo.create({
      titre: dto.titre,
      description: dto.description,
      domaine: dto.domaine,
      formateur: dto.formateur,
      type: dto.type,
      prix: dto.prix,
      places_limitees: dto.places_limitees,
      places_disponibles: dto.places_limitees ? (dto.places_disponibles || 0) : undefined,
      duree: dto.duree,
      mode: dto.mode,
      localisation: dto.localisation,
      certifiante: dto.certifiante,
      a_la_une: dto.a_la_une,
      dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : undefined,
      dateFin: dto.dateFin ? new Date(dto.dateFin) : undefined,
      lien_formation: dto.lien_formation,
      gratuit: dto.gratuit,
      niveau: dto.niveau,
      categorie: dto.categorie,
      statut: 'en_attente',
      expertId,
      image: imageFile?.filename || '',
    });
    const saved = await this.formationRepo.save(formation);
    this.logger.log(`Expert ${expertId} a proposé la formation ${saved.id}`);
    return saved;
  }

  async findByExpert(expertId: number): Promise<Formation[]> {
    return this.formationRepo.find({
      where: { expertId },
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== ADMIN ====================

  async create(dto: CreateFormationDto, imageFile: Express.Multer.File | undefined): Promise<Formation> {
    const formation = this.formationRepo.create({
      titre: dto.titre,
      description: dto.description,
      domaine: dto.domaine,
      formateur: dto.formateur,
      type: dto.type,
      prix: dto.prix,
      places_limitees: dto.places_limitees,
      places_disponibles: dto.places_limitees ? (dto.places_disponibles || 0) : undefined,
      duree: dto.duree,
      mode: dto.mode,
      localisation: dto.localisation,
      certifiante: dto.certifiante,
      a_la_une: dto.a_la_une,
      dateDebut: dto.dateDebut ? new Date(dto.dateDebut) : undefined,
      dateFin: dto.dateFin ? new Date(dto.dateFin) : undefined,
      lien_formation: dto.lien_formation,
      gratuit: dto.gratuit,
      niveau: dto.niveau,
      categorie: dto.categorie,
      statut: dto.statut || 'brouillon',
      image: imageFile?.filename || '',
    });
    const saved = await this.formationRepo.save(formation);
    this.logger.log(`Admin a créé la formation ${saved.id}`);
    return saved;
  }

  async findAll(): Promise<Formation[]> {
    return this.formationRepo.find({ order: { createdAt: 'DESC' } });
  }

  async update(id: number, dto: UpdateFormationDto, imageFile: Express.Multer.File | undefined): Promise<Formation> {
    const formation = await this.findOneOrFail(id);
    if (imageFile) formation.image = imageFile.filename;
    if (dto.titre !== undefined) formation.titre = dto.titre;
    if (dto.description !== undefined) formation.description = dto.description;
    if (dto.domaine !== undefined) formation.domaine = dto.domaine;
    if (dto.formateur !== undefined) formation.formateur = dto.formateur;
    if (dto.type !== undefined) formation.type = dto.type;
    if (dto.prix !== undefined) formation.prix = dto.prix;
    if (dto.places_limitees !== undefined) formation.places_limitees = dto.places_limitees;
    if (dto.places_disponibles !== undefined) formation.places_disponibles = dto.places_disponibles;
    if (dto.duree !== undefined) formation.duree = dto.duree;
    if (dto.mode !== undefined) formation.mode = dto.mode;
    if (dto.localisation !== undefined) formation.localisation = dto.localisation;
    if (dto.certifiante !== undefined) formation.certifiante = dto.certifiante;
    if (dto.a_la_une !== undefined) formation.a_la_une = dto.a_la_une;
    if (dto.dateDebut !== undefined) formation.dateDebut = new Date(dto.dateDebut);
    if (dto.dateFin !== undefined) formation.dateFin = new Date(dto.dateFin);
    if (dto.lien_formation !== undefined) formation.lien_formation = dto.lien_formation;
    if (dto.gratuit !== undefined) formation.gratuit = dto.gratuit;
    if (dto.niveau !== undefined) formation.niveau = dto.niveau;
    if (dto.categorie !== undefined) formation.categorie = dto.categorie;
    if (dto.statut !== undefined) formation.statut = dto.statut;
    const updated = await this.formationRepo.save(formation);
    this.logger.log(`Formation ${id} mise à jour`);
    return updated;
  }

  async updateStatut(id: number, dto: UpdateStatutDto): Promise<Formation> {
    const formation = await this.findOneOrFail(id);
    formation.statut = dto.statut;
    if (dto.commentaire) formation.commentaire_admin = dto.commentaire;
    const updated = await this.formationRepo.save(formation);
    this.logger.log(`Formation ${id} : statut changé à ${dto.statut}`);
    return updated;
  }

  async delete(id: number): Promise<{ success: boolean }> {
    const formation = await this.findOneOrFail(id);
    await this.formationRepo.remove(formation);
    this.logger.log(`Formation ${id} supprimée`);
    return { success: true };
  }

  async decrementPlaces(formationId: number): Promise<void> {
    const formation = await this.findOneOrFail(formationId);
    if (formation.places_limitees) {
      if (formation.places_disponibles <= 0) {
        throw new BadRequestException('Plus de places disponibles pour cette formation');
      }
      formation.places_disponibles -= 1;
      await this.formationRepo.save(formation);
      this.logger.log(`Formation ${formationId} : places restantes = ${formation.places_disponibles}`);
    }
  }

  async incrementPlaces(formationId: number): Promise<void> {
    const formation = await this.findOneOrFail(formationId);
    if (formation.places_limitees) {
      formation.places_disponibles = (formation.places_disponibles || 0) + 1;
      await this.formationRepo.save(formation);
      this.logger.log(`Formation ${formationId} : places restituées → ${formation.places_disponibles}`);
    }
  }

  // ==================== PUBLIQUES ====================

  async findPublished(): Promise<Formation[]> {
    return this.formationRepo.find({
      where: { statut: 'publie' },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Formation> {
    return this.findOneOrFail(id);
  }
}