import {
  Controller, Get, Post, Patch, Put, Delete,
  Body, Param, UseGuards, Req, ValidationPipe, ParseIntPipe, BadRequestException,
} from '@nestjs/common';
import { DemandesServiceService, CreateDemandeDto, UpdateDemandeDto, UpdateStatutDto, NotifierExpertsDto, AssignerExpertDto } from './demandes-service.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('demandes-service')
export class DemandesServiceController {
  constructor(private readonly service: DemandesServiceService) {}

  // ==================== ADMIN ====================

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  getAll() {
    return this.service.getAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/statut')
  updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateStatutDto,
  ) {
    return this.service.updateStatut(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  supprimer(@Param('id', ParseIntPipe) id: number) {
    return this.service.supprimer(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/notifier-experts')
  async notifierExperts(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    let expertIds: number[];
    if (Array.isArray(body)) {
      expertIds = body;
    } else if (body && body.expert_ids && Array.isArray(body.expert_ids)) {
      expertIds = body.expert_ids;
    } else {
      throw new BadRequestException('Le tableau d\'IDs des experts est requis');
    }
    const dto: NotifierExpertsDto = { expert_ids: expertIds };
    return this.service.notifierExperts(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get(':id/experts-acceptes')
  getExpertsAcceptes(@Param('id', ParseIntPipe) id: number) {
    return this.service.getExpertsAcceptes(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/assigner')
  assignerExpert(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: AssignerExpertDto,
  ) {
    return this.service.assignerExpert(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('formation/:demandeId/accept')
  acceptFormationDemande(@Param('demandeId', ParseIntPipe) demandeId: number) {
    return this.service.acceptFormationDemande(demandeId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('formation/:demandeId/reject')
  rejectFormationDemande(@Param('demandeId', ParseIntPipe) demandeId: number) {
    return this.service.rejectFormationDemande(demandeId);
  }

  // ==================== STARTUPS ====================

  @UseGuards(JwtAuthGuard)
  @Get('mes-demandes')
  getMesDemandes(@Req() req: any) {
    return this.service.getMesDemandes(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const dto: CreateDemandeDto = {
      service: body.service,
      description: body.description,
      delai: body.delai,
      objectif: body.objectif,
      telephone: body.telephone,
      type_application: body.type_application,
      domaine: body.domaine,
    };
    return this.service.create(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('formation/:formationId')
  createFormationDemande(
    @Param('formationId', ParseIntPipe) formationId: number,
    @Req() req: any,
  ) {
    return this.service.createFormationDemande(req.user.id, formationId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateDemande(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateDemandeDto,
    @Req() req: any,
  ) {
    return this.service.updateDemande(id, req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('client/:id')
  deleteDemande(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.deleteDemande(id, req.user.id);
  }

  // ==================== EXPERTS ====================

  @UseGuards(JwtAuthGuard)
  @Get('expert/assignees')
  async getDemandesAssignees(@Req() req: any) {
    return this.service.getDemandesAssignees(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('expert/notifications')
  async getNotifications(@Req() req: any) {
    return this.service.getNotificationsForExpert(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/accepter-mission')
  accepterMission(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.accepterMission(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/refuser-mission')
  refuserMission(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.service.refuserMission(id, req.user.id);
  }
}