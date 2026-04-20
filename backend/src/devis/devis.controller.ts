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
    const userId = req.user.id;
    return this.devisService.create(userId, {
      demande_id: body.demande_id,
      montant: body.montant,
      description: body.description,
      delai: body.delai,
    });
  }

  // Expert : voir ses devis
  @UseGuards(JwtAuthGuard)
  @Get('expert/mes-devis')
  async getMesDevis(@Req() req: any) {
    const userId = req.user.id;
    return this.devisService.findByExpert(userId);
  }

  // Client : voir ses devis reçus
  @UseGuards(JwtAuthGuard)
  @Get('client/mes-devis')
  async getMesDevisClient(@Req() req: any) {
    const userId = req.user.id;
    return this.devisService.findByClient(userId);
  }

  // Admin : voir tous les devis
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('all')
  async getAllDevis() {
    return this.devisService.findAll();
  }

  // Client : accepter/refuser un devis
  @UseGuards(JwtAuthGuard)
  @Patch(':id/client-statut')
  async updateStatutClient(@Param('id') id: string, @Req() req: any, @Body() body: { statut: string }) {
    const userId = req.user.id;
    return this.devisService.updateStatutByClient(+id, userId, body.statut);
  }

  // Admin : changer statut (optionnel)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/statut')
  async updateStatut(@Param('id') id: string, @Body() body: { statut: string }) {
    return this.devisService.updateStatut(+id, body.statut);
  }
}