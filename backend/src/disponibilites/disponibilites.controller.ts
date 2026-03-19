import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { DisponibilitesService } from './disponibilites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ExpertsService } from '../experts/experts.service';

@Controller('disponibilites')
export class DisponibilitesController {
  constructor(
    private readonly dispoService: DisponibilitesService,
    private readonly expertsService: ExpertsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: any, @Req() req) {
    const expert = await this.expertsService.findByUser(req.user.id);
    if (!expert) throw new NotFoundException('Profil expert non trouvé');
    return this.dispoService.create({ ...body, expertId: expert.id });
  }

  @Get('expert/:expertId')
  async getByExpert(@Param('expertId') expertId: string) {
    return this.dispoService.findByExpert(+expertId);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() body: any, @Req() req) {
    return this.dispoService.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string, @Req() req) {
    await this.dispoService.remove(+id);
    return { message: 'Disponibilité supprimée' };
  }
}