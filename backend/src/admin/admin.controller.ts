import { Controller, Get, Patch, Delete, Param, Body } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: number) {
    return this.adminService.deleteUser(id);
  }

  @Patch('users/:id/statut')
  toggleStatut(@Param('id') id: number, @Body() body: any) {
    return this.adminService.toggleUserStatut(id, body.statut);
  }

  @Get('experts')
  getAllExperts() {
    return this.adminService.getAllExperts();
  }

  @Get('experts/attente')
  getExpertEnAttente() {
    return this.adminService.getExpertEnAttente();
  }

  @Patch('experts/:id/valider')
  validerExpert(@Param('id') id: number) {
    return this.adminService.validerExpert(id);
  }

  @Patch('experts/:id/refuser')
  refuserExpert(@Param('id') id: number) {
    return this.adminService.refuserExpert(id);
  }

  @Get('startups')
  getAllStartups() {
    return this.adminService.getAllStartups();
  }

  @Get('startups/attente')
  getStartupEnAttente() {
    return this.adminService.getStartupEnAttente();
  }

  @Patch('startups/:id/valider')
  validerStartup(@Param('id') id: number) {
    return this.adminService.validerStartup(id);
  }

  @Patch('startups/:id/refuser')
  refuserStartup(@Param('id') id: number) {
    return this.adminService.refuserStartup(id);
  }
}