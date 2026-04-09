import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('contact')
export class ContactController {
  constructor(private svc: ContactService) {}

  @Post('message')
  sendMessage(@Body() body: any) {
    return this.svc.sendMessage(body);
  }

  @Get('config')
  getConfig() {
    return this.svc.getConfig();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/messages')
  getAll() {
    return this.svc.getAllMessages();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/messages/:id')
  getOne(@Param('id') id: string) {
    return this.svc.getMessage(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/messages/:id/lu')
  marquerLu(@Param('id') id: string) {
    return this.svc.marquerLu(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/messages/:id/repondre')
  repondre(@Param('id') id: string, @Body() body: any) {
    return this.svc.repondre(+id, body.reponse);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/messages/:id/archiver')
  archiver(@Param('id') id: string) {
    return this.svc.archiverMessage(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/messages/:id')
  supprimer(@Param('id') id: string) {
    return this.svc.supprimerMessage(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put('admin/config')
  updateConfig(@Body() body: any) {
    return this.svc.updateConfig(body);
  }
}
