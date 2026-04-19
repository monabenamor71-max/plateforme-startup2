import { Controller, Post, Get, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { DevisService } from './devis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('devis')
export class DevisController {
  constructor(private readonly devisService: DevisService) {}

  // Expert : créer un devis
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: any, @Body() body: { demande_id: number; montant: number; description: string; delai?: string }) {
    const expertId = req.user.expertId;
    if (!expertId) throw new Error('Expert non authentifié');
    return this.devisService.create({
      demande_id: body.demande_id,
      expert_id: expertId,
      montant: body.montant,
      description: body.description,
      delai: body.delai,
    });
  }

  // Expert : voir ses devis envoyés
  @UseGuards(JwtAuthGuard)
  @Get('expert/mes-devis')
  async getMesDevis(@Req() req: any) {
    const expertId = req.user.expertId;
    if (!expertId) throw new Error('Expert non authentifié');
    return this.devisService.findByExpert(expertId);
  }

  // Startup : voir les devis reçus
  @UseGuards(JwtAuthGuard)
  @Get('client/mes-devis')
  async getMesDevisClient(@Req() req: any) {
    const userId = req.user.id;
    return this.devisService.findByClient(userId);
  }

  // Startup : accepter/refuser un devis
  @UseGuards(JwtAuthGuard)
  @Patch(':id/client-statut')
  async updateStatutClient(@Param('id') id: string, @Req() req: any, @Body() body: { statut: string }) {
    const userId = req.user.id;
    return this.devisService.updateStatutByClient(+id, userId, body.statut);
  }

  // ⭐ ADMIN : voir tous les devis
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async getAllDevis() {
    return this.devisService.findAll();
  }

  // Admin : changer le statut d’un devis
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/statut')
  async updateStatut(@Param('id') id: string, @Body() body: { statut: string }) {
    return this.devisService.updateStatut(+id, body.statut);
  }
}