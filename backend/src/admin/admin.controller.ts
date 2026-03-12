import { Controller, Get, Put, Delete, Param, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Get('experts')
  getAllExperts() {
    return this.adminService.getAllExperts();
  }

  @UseGuards(JwtAuthGuard)
  @Put('experts/:id/valider')
  validerExpert(@Param('id') id: string) {
    return this.adminService.validerExpert(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Put('experts/:id/refuser')
  refuserExpert(@Param('id') id: string) {
    return this.adminService.refuserExpert(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id/activer')
  activerUser(@Param('id') id: string) {
    return this.adminService.activerUser(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Put('users/:id/desactiver')
  desactiverUser(@Param('id') id: string) {
    return this.adminService.desactiverUser(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Delete('users/:id')
  supprimerUser(@Param('id') id: string) {
    return this.adminService.supprimerUser(Number(id));
  }
}