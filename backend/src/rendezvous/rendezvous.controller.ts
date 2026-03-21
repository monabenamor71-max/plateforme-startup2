import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RendezvousService } from './rendezvous.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpertsService } from '../experts/experts.service';

@Controller('rendez-vous')
@UseGuards(JwtAuthGuard)
export class RendezvousController {
  constructor(
    private readonly rdvService: RendezvousService,
    private readonly expertsService: ExpertsService,
  ) {}

  @Post()
  async creer(
    @Req() req: any,
    @Body() body: { expert_id: number; date_rdv: string; heure: string; motif: string },
  ) {
    return this.rdvService.creer(req.user.id, body.expert_id, {
      date_rdv: body.date_rdv,
      heure: body.heure,
      motif: body.motif,
    });
  }

  @Get('startup')
  getMesRdvStartup(@Req() req: any) {
    return this.rdvService.getMesRdvStartup(req.user.id);
  }

  @Get('expert')
  async getMesRdvExpert(@Req() req: any) {
    const expert = await this.expertsService.findByUser(req.user.id);
    if (!expert) return [];
    return this.rdvService.getMesRdvExpert(expert.id);
  }

  @Put(':id/confirmer')
  confirmer(@Param('id') id: string) {
    return this.rdvService.confirmer(+id);
  }

  @Put(':id/annuler')
  annuler(@Param('id') id: string) {
    return this.rdvService.annuler(+id);
  }
}