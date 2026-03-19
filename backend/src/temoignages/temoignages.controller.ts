import { Controller, Post, Body, UseGuards, Req, Get, Param, Delete } from '@nestjs/common';
import { TemoignagesService } from './temoignages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('temoignages')
export class TemoignagesController {
  constructor(private readonly temoignagesService: TemoignagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: { texte: string }, @Req() req) {
    return this.temoignagesService.create(req.user.id, body.texte);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAll() {
    return this.temoignagesService.findAll();
  }

  @Get('count-en-attente')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async countEnAttente() {
    const count = await this.temoignagesService.compterEnAttente();
    return { count };
  }

  @Post(':id/valider')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async valider(@Param('id') id: string) {
    return this.temoignagesService.valider(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async supprimer(@Param('id') id: string) {
    await this.temoignagesService.supprimer(+id);
    return { message: 'Témoignage supprimé' };
  }
}