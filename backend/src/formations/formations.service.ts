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

  // ✅ Création par un expert (statut = 'en_attente')
  async createFromExpert(data: any, imageFile: any, expertId: number) {
    const enLigne = data.en_ligne === 'true' || data.en_ligne === true;
    const gratuit = data.gratuit === 'true' || data.gratuit === true;
    const placesLimitees = data.places_limitees === 'true' || data.places_limitees === true;

    const formation = this.formationRepo.create({
      titre: data.titre,
      description: data.description,
      duree: data.duree || null,
      localisation: data.localisation || null,
      mode: enLigne ? 'en_ligne' : 'presentiel',
      lien_formation: data.lien_formation || null,
      formateur: data.nom_formateur || null,
      places_limitees: placesLimitees,
      places_disponibles: placesLimitees ? (parseInt(data.places_limitees_valeur) || 0) : 0,
      niveau: data.niveau || null,
      prix: data.prix ? parseInt(data.prix) : 0,
      gratuit: gratuit,
      type: data.type || 'formation',
      image: imageFile?.filename || null,
      statut: 'en_attente',
      expertId: expertId,
    });
    return await this.formationRepo.save(formation);
  }

  // ✅ Récupérer les formations d'un expert
  async findByExpert(expertId: number) {
    return await this.formationRepo.find({
      where: { expertId },
      order: { createdAt: 'DESC' },
    });
  }

  // Création par admin
  async create(data: any, imageFile?: any) {
    const formation = this.formationRepo.create({
      ...data,
      image: imageFile?.filename || null,
    });
    return await this.formationRepo.save(formation);
  }

  async findAll() {
    return await this.formationRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findPublished() {
    return await this.formationRepo.find({
      where: { statut: 'publie' },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number) {
    const formation = await this.formationRepo.findOne({ where: { id } });
    if (!formation) throw new NotFoundException('Formation non trouvée');
    return formation;
  }

  async update(id: number, data: any, imageFile?: any) {
    const formation = await this.findOne(id);
    if (imageFile) data.image = imageFile.filename;
    Object.assign(formation, data);
    return await this.formationRepo.save(formation);
  }

  async updateStatut(id: number, statut: string) {
    const formation = await this.findOne(id);
    formation.statut = statut;
    return await this.formationRepo.save(formation);
  }

  async delete(id: number) {
    const formation = await this.findOne(id);
    return await this.formationRepo.remove(formation);
  }
}