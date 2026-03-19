import { Controller, Get, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() { return this.adminService.getStats(); }

  @Get('users')
  getUsers() { return this.adminService.getUsers(); }

  @Put('users/:id/activer')
  activerUser(@Param('id') id: string) { return this.adminService.toggleUser(+id, 'activer'); }

  @Put('users/:id/desactiver')
  desactiverUser(@Param('id') id: string) { return this.adminService.toggleUser(+id, 'desactiver'); }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) { return this.adminService.deleteUser(+id); }

  @Get('experts')
  getExperts() { return this.adminService.getExperts(); }

  @Put('experts/:id/valider')
  validerExpert(@Param('id') id: string) { return this.adminService.validerExpert(+id); }

  @Put('experts/:id/refuser')
  refuserExpert(@Param('id') id: string) { return this.adminService.refuserExpert(+id); }

  @Get('startups')
  getStartups() { return this.adminService.getStartups(); }

  @Put('startups/:id/valider')
  validerStartup(@Param('id') id: string) { return this.adminService.validerStartup(+id); }

  @Get('temoignages')
  getTemoignages() { return this.adminService.getTemoignages(); }

  @Put('temoignages/:id/valider')
  validerTemoignage(@Param('id') id: string) { return this.adminService.validerTemoignage(+id); }

  @Delete('temoignages/:id')
  deleteTemoignage(@Param('id') id: string) { return this.adminService.deleteTemoignage(+id); }
}