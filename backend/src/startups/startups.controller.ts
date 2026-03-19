import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { StartupsService } from './startups.service';
import { Startup } from './startup.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('startups')
export class StartupsController {
  constructor(private readonly startupsService: StartupsService) {}

  // Admin : toutes les startups (validées ou non)
  @Get()
@UseGuards(JwtAuthGuard, AdminGuard)
async getAllStartups(): Promise<Startup[]> {
  return this.startupsService.findAll();
}

  // Profil de la startup connectée
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyStartupProfile(@Req() req): Promise<Startup> {
    const startup = await this.startupsService.findByUser(req.user.id);
    if (!startup) throw new NotFoundException('Profil startup non trouvé');
    return startup;
  }

  // Mettre à jour le profil de la startup connectée
  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMyStartupProfile(@Req() req, @Body() updateData: any): Promise<Startup> {
    const startup = await this.startupsService.findByUser(req.user.id);
    if (!startup) throw new NotFoundException('Profil startup non trouvé');
    return this.startupsService.update(startup.id, updateData);
  }

  // Admin : récupérer une startup par ID
  @Get(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findOne(@Param('id') id: string): Promise<Startup> {
    return this.startupsService.findOne(+id);
  }

  // Admin : valider une startup
  @Post(':id/valider')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async validerStartup(@Param('id') id: string): Promise<Startup> {
    return this.startupsService.update(+id, { valid: true });
  }

  // Admin : refuser une startup
  @Post(':id/refuser')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async refuserStartup(@Param('id') id: string): Promise<Startup> {
    return this.startupsService.update(+id, { valid: false });
  }

  // Créer un profil startup (pour l'utilisateur connecté, utilisé par l'inscription)
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createStartupDto: any): Promise<Startup> {
    return this.startupsService.create(req.user.id, createStartupDto);
  }

  // Admin : mettre à jour une startup par ID
  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(@Param('id') id: string, @Body() updateStartupDto: any): Promise<Startup> {
    return this.startupsService.update(+id, updateStartupDto);
  }

  // Admin : supprimer une startup
  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string): Promise<void> {
    return this.startupsService.remove(+id);
  }
}