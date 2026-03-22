import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TemoignagesService } from './temoignages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('temoignages')
export class TemoignagesController {
  constructor(private readonly service: TemoignagesService) {}

  @Get('publics')
  findValides() {
    return this.service.findValides();
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  creer(@Req() req: any, @Body() body: { texte: string }) {
    return this.service.creer(req.user.id, body.texte);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.service.findAll();
  }

  @Get('count-en-attente')
  @UseGuards(JwtAuthGuard)
  countEnAttente() {
    return this.service.countEnAttente();
  }

  @Put(':id/valider')
  @UseGuards(JwtAuthGuard)
  valider(@Param('id') id: string) {
    return this.service.valider(+id);
  }

  @Put(':id/refuser')
  @UseGuards(JwtAuthGuard)
  refuser(@Param('id') id: string) {
    return this.service.refuser(+id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  supprimer(@Param('id') id: string) {
    return this.service.supprimer(+id);
  }
}