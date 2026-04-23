// src/contact/contact.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
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
    return await this.configRepo.save(config);
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
    return await this.messageRepo.save(message);
  }

  async deleteMessage(id: number): Promise<void> {
    const result = await this.messageRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Message non trouvé');
  }

  async replyToMessage(id: number, reponse: string): Promise<ContactMessage> {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Message non trouvé');

    // Enregistre la réponse en base
    message.admin_reply = reponse;
    message.replied_at = new Date();
    const updated = await this.messageRepo.save(message);

    // Envoie l'email au client
    await this.mailService.sendReplyEmail(
      message.email,
      `${message.prenom} ${message.nom}`,
      reponse,
    );

    return updated;
  }
}