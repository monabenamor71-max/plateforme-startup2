import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('message')
  async create(@Body() body: { nom: string; prenom: string; email: string; sujet: string; message: string }) {
    const message = await this.contactService.create(body);
    return {
      success: true,
      message: 'Votre message a été envoyé avec succès',
      data: { id: message.id }
    };
  }

  @Get('admin/messages')
  async findAll() {
    const messages = await this.contactService.findAll();
    return { success: true, data: messages };
  }

  @Get('admin/messages/:id')
  async findOne(@Param('id') id: string) {
    const message = await this.contactService.findOne(+id);
    return { success: true, data: message };
  }

  @Put('admin/messages/:id/lu')
  async marquerCommeLu(@Param('id') id: string) {
    const message = await this.contactService.marquerCommeLu(+id);
    return { success: true, data: message, message: 'Message marqué comme lu' };
  }

  @Put('admin/messages/:id/repondre')
  async repondre(@Param('id') id: string, @Body() body: { reponse: string }) {
    const adminId = 1; // L'ID de l'admin connecté
    const message = await this.contactService.repondre(+id, body.reponse, adminId);
    return { success: true, data: message, message: 'Réponse envoyée avec succès' };
  }

  @Delete('admin/messages/:id')
  async remove(@Param('id') id: string) {
    await this.contactService.remove(+id);
    return { success: true, message: 'Message supprimé avec succès' };
  }

  @Get('admin/stats')
  async getStats() {
    const stats = await this.contactService.getStats();
    return { success: true, data: stats };
  }
}