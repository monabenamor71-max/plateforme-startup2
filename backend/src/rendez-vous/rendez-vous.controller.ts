import { Controller, Get, Post, Put, Delete, Body, Param, Request, UseGuards, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { RendezVousService } from './rendez-vous.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rendez-vous')
export class RendezVousController {
  constructor(private rdvService: RendezVousService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any, @Request() req: any) {
    return this.rdvService.createRdv(body.expert_id, req.user.id, body.date_rdv, body.sujet);
  }

  @Get('expert')
  @UseGuards(JwtAuthGuard)
  getByExpert(@Request() req: any) {
    return this.rdvService.getByExpert(req.user.id);
  }

  @Get('startup')
  @UseGuards(JwtAuthGuard)
  getByClient(@Request() req: any) {
    return this.rdvService.getByClient(req.user.id);
  }

  @Put(':id/confirmer')
  @UseGuards(JwtAuthGuard)
  confirmer(@Param('id') id: number) {
    return this.rdvService.confirmer(id);
  }

  @Put(':id/annuler')
  @UseGuards(JwtAuthGuard)
  annuler(@Param('id') id: number) {
    return this.rdvService.annuler(id);
  }

  // ✅ MODIFICATION : mettre à jour date et sujet
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: number, @Body() body: { date_rdv: string; sujet: string }, @Request() req: any) {
    const rdv = await this.rdvService.getById(id);
    if (!rdv) throw new NotFoundException('Rendez-vous non trouvé');
    if (rdv.client_id !== req.user.id) throw new ForbiddenException('Vous ne pouvez modifier que vos propres rendez-vous');
    if (rdv.statut !== 'en_attente') throw new BadRequestException('Seuls les rendez-vous en attente peuvent être modifiés');
    return this.rdvService.updateRdv(id, body.date_rdv, body.sujet);
  }

  // ✅ SUPPRESSION
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: number, @Request() req: any) {
    const rdv = await this.rdvService.getById(id);
    if (!rdv) throw new NotFoundException('Rendez-vous non trouvé');
    if (rdv.client_id !== req.user.id) throw new ForbiddenException('Vous ne pouvez supprimer que vos propres rendez-vous');
    if (rdv.statut !== 'en_attente') throw new BadRequestException('Seuls les rendez-vous en attente peuvent être supprimés');
    return this.rdvService.deleteRdv(id);
  }
}