import { Controller, Post, Get, Patch, Delete, Body, Param, Request, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TemoignagesService } from './temoignages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('temoignages')
export class TemoignagesController {
  constructor(private readonly temoignagesService: TemoignagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: { texte: string }, @Request() req: any) {
    const dto = { user_id: req.user.id, texte: body.texte };
    return this.temoignagesService.create(dto);
  }

  @Get('publics')
  async getPublics() {
    return this.temoignagesService.getPublics();
  }

  @Get('mes-temoignages')
  @UseGuards(JwtAuthGuard)
  async getMesTemoignages(@Request() req: any) {
    return this.temoignagesService.getMesTemoignages(req.user.id);
  }

  @Get('all')
  async getAll() {
    return this.temoignagesService.getAll();
  }

  @Patch(':id/valider')
  async valider(@Param('id', ParseIntPipe) id: number) {
    return this.temoignagesService.valider(id);
  }

  @Patch(':id/refuser')
  async refuser(@Param('id', ParseIntPipe) id: number) {
    return this.temoignagesService.refuser(id);
  }

  @Delete(':id')
  async supprimer(@Param('id', ParseIntPipe) id: number) {
    return this.temoignagesService.supprimer(id);
  }
}