import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { DemandesServiceService } from './demandes-service.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('demandes-service')
export class DemandesServiceController {
  constructor(private readonly service: DemandesServiceService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  getAll() {
    return this.service.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('mes-demandes')
  getMesDemandes(@Req() req: any) {
    return this.service.getMesDemandes(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() data: any, @Req() req: any) {
    data.user_id = req.user.id;
    return this.service.create(data);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/statut')
  updateStatut(@Param('id') id: string, @Body() body: { statut: string; commentaire?: string }) {
    return this.service.updateStatut(+id, body.statut, body.commentaire);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  supprimer(@Param('id') id: string) {
    return this.service.supprimer(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('formation/:formationId')
  createFormationDemande(@Param('formationId') formationId: string, @Req() req: any) {
    return this.service.createFormationDemande(req.user.id, +formationId);
  }

@Patch('formation/:demandeId/accept')
acceptFormationDemande(@Param('demandeId') demandeId: string) {
  return this.service.acceptFormationDemande(+demandeId);
}
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('formation/:demandeId/reject')
  rejectFormationDemande(@Param('demandeId') demandeId: string) {
    return this.service.rejectFormationDemande(+demandeId);
  }
}