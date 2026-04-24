// src/contact/contact.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactConfig } from './contact-config.entity';
import { ContactMessage } from './contact-message.entity';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { UpdateContactConfigDto } from './dto/update-contact-config.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactConfig)
    private configRepo: Repository<ContactConfig>,
    @InjectRepository(ContactMessage)
    private messageRepo: Repository<ContactMessage>,
    private mailService: MailService,
  ) {}

  async getConfig(): Promise<ContactConfig> {
    let config = await this.configRepo.findOne({ where: {} });
    if (!config) {
      config = this.configRepo.create({
        email: 'contact@beh.com',
        telephone: '+216 00 000 000',
        adresse: 'Tunis, Tunisie',
        horaires: 'Lun - Ven : 9h00 - 18h00',
        description_hero: 'Une question ? Un projet ? Notre équipe est à votre écoute.',
      });
      config = await this.configRepo.save(config);
      if (!config || !config.id) {
        throw new BadRequestException('Erreur lors de la création de la configuration par défaut');
      }
    }
    return config;
  }

  async updateConfig(updateData: UpdateContactConfigDto): Promise<ContactConfig> {
    const config = await this.getConfig();
    if (updateData.email !== undefined) config.email = updateData.email;
    if (updateData.telephone !== undefined) config.telephone = updateData.telephone;
    if (updateData.adresse !== undefined) config.adresse = updateData.adresse;
    if (updateData.horaires !== undefined) config.horaires = updateData.horaires;
    if (updateData.description_hero !== undefined) config.description_hero = updateData.description_hero;
    const updated = await this.configRepo.save(config);
    if (!updated) {
      throw new BadRequestException('Erreur lors de la mise à jour de la configuration');
    }
    return updated;
  }

  async saveContactMessage(dto: CreateContactMessageDto): Promise<ContactMessage> {
    const message = this.messageRepo.create({
      nom: dto.nom,
      prenom: dto.prenom,
      email: dto.email,
      phone: dto.phone,
      subject: dto.subject,
      message: dto.message,
      name: dto.name || `${dto.prenom} ${dto.nom}`,
      is_read: false,
    });
    const saved = await this.messageRepo.save(message);
    if (!saved || !saved.id) {
      throw new BadRequestException('Erreur lors de la sauvegarde du message');
    }
    // Envoi d'email à l'admin
    await this.mailService.sendContactNotification(
      dto.nom,
      dto.prenom,
      dto.email,
      dto.subject,
      dto.message,
    );
    return saved;
  }

  async getAllMessages(): Promise<ContactMessage[]> {
    return await this.messageRepo.find({ order: { createdAt: 'DESC' } });
  }

  async markAsRead(id: number): Promise<ContactMessage> {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Message non trouvé');
    message.is_read = true;
    const updated = await this.messageRepo.save(message);
    if (!updated) {
      throw new BadRequestException('Erreur lors du marquage du message comme lu');
    }
    return updated;
  }

  async deleteMessage(id: number): Promise<void> {
    const result = await this.messageRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Message non trouvé');
  }

  async replyToMessage(id: number, reponse: string): Promise<ContactMessage> {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Message non trouvé');

    message.admin_reply = reponse;
    message.replied_at = new Date();
    const updated = await this.messageRepo.save(message);
    if (!updated) {
      throw new BadRequestException('Erreur lors de l’enregistrement de la réponse');
    }

    await this.mailService.sendReplyEmail(
      message.email,
      `${message.prenom} ${message.nom}`,
      reponse,
    );

    return updated;
  }
}