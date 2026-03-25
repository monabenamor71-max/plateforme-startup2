import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';
import { Demande } from './entities/demande.entity';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Demande)
    private demandeRepository: Repository<Demande>,
  ) {}

  // SERVICES
  async findAllServices() {
    return this.serviceRepository.find({ order: { id: 'ASC' } });
  }

  async findActiveServices() {
    return this.serviceRepository.find({ where: { actif: true }, order: { id: 'ASC' } });
  }

  async findServiceById(id: number) {
    const service = await this.serviceRepository.findOne({ where: { id } });
    if (!service) throw new NotFoundException('Service non trouvé');
    return service;
  }

  async findServiceBySlug(slug: string) {
    const service = await this.serviceRepository.findOne({ where: { slug, actif: true } });
    if (!service) throw new NotFoundException('Service non trouvé');
    return service;
  }

  async createService(data: any) {
    const service = this.serviceRepository.create(data);
    return this.serviceRepository.save(service);
  }

  async updateService(id: number, data: any) {
    const service = await this.findServiceById(id);
    Object.assign(service, data);
    return this.serviceRepository.save(service);
  }

  async deleteService(id: number) {
    const service = await this.findServiceById(id);
    await this.serviceRepository.remove(service);
  }

  // DEMANDES
  async createDemande(userId: number, data: any) {
    const demande = this.demandeRepository.create({
      user_id: userId,
      service_id: data.service_id,
      message: data.message,
      date_souhaitee: data.date_souhaitee,
      statut: 'en_attente',
    });
    return this.demandeRepository.save(demande);
  }

  async findAllDemandes() {
    return this.demandeRepository.find({
      order: { created_at: 'DESC' }
    });
  }

  async findDemandesByUser(userId: number) {
    return this.demandeRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    });
  }

  async findDemandeById(id: number) {
    const demande = await this.demandeRepository.findOne({ where: { id } });
    if (!demande) throw new NotFoundException('Demande non trouvée');
    return demande;
  }

  async repondreDemande(id: number, data: any) {
    const demande = await this.findDemandeById(id);
    demande.statut = data.statut;
    demande.reponse_admin = data.reponse_admin;
    if (data.expert_id) {
      demande.expert_id = data.expert_id;
    }
    return this.demandeRepository.save(demande);
  }

  async getDemandesStats() {
    const total = await this.demandeRepository.count();
    const en_attente = await this.demandeRepository.count({ where: { statut: 'en_attente' } });
    const accepte = await this.demandeRepository.count({ where: { statut: 'accepte' } });
    const refuse = await this.demandeRepository.count({ where: { statut: 'refuse' } });
    const en_cours = await this.demandeRepository.count({ where: { statut: 'en_cours' } });
    const termine = await this.demandeRepository.count({ where: { statut: 'termine' } });
    return { total, en_attente, accepte, refuse, en_cours, termine };
  }
}