import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  async findAll() {
    const services = await this.servicesService.findActiveServices();
    return { success: true, data: services };
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    const service = await this.servicesService.findServiceBySlug(slug);
    return { success: true, data: service };
  }

  @Post('demandes')
  async createDemande(@Body() body: { service_id: number; message?: string; date_souhaitee?: string }) {
    const userId = 1;
    const demande = await this.servicesService.createDemande(userId, body);
    return { success: true, data: demande, message: 'Demande envoyée' };
  }

  @Get('mes-demandes')
  async getMesDemandes() {
    const userId = 1;
    const demandes = await this.servicesService.findDemandesByUser(userId);
    return { success: true, data: demandes };
  }

  @Get('admin/services')
  async adminGetAllServices() {
    const services = await this.servicesService.findAllServices();
    return { success: true, data: services };
  }

  @Post('admin/services')
  async adminCreateService(@Body() body: any) {
    const service = await this.servicesService.createService(body);
    return { success: true, data: service, message: 'Service créé' };
  }

  @Put('admin/services/:id')
  async adminUpdateService(@Param('id') id: string, @Body() body: any) {
    const service = await this.servicesService.updateService(+id, body);
    return { success: true, data: service, message: 'Service modifié' };
  }

  @Delete('admin/services/:id')
  async adminDeleteService(@Param('id') id: string) {
    await this.servicesService.deleteService(+id);
    return { success: true, message: 'Service supprimé' };
  }

  @Get('admin/demandes')
  async adminGetAllDemandes() {
    const demandes = await this.servicesService.findAllDemandes();
    return { success: true, data: demandes };
  }

  @Get('admin/demandes/:id')
  async adminGetDemande(@Param('id') id: string) {
    const demande = await this.servicesService.findDemandeById(+id);
    return { success: true, data: demande };
  }

  @Put('admin/demandes/:id')
  async adminRepondreDemande(@Param('id') id: string, @Body() body: { statut: string; reponse_admin: string }) {
    const demande = await this.servicesService.repondreDemande(+id, body);
    return { success: true, data: demande, message: 'Demande traitée' };
  }

  @Get('admin/stats')
  async getStats() {
    const stats = await this.servicesService.getDemandesStats();
    return { success: true, data: stats };
  }
}