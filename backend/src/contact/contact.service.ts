import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './entities/contact-message.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactMessage)
    private contactRepository: Repository<ContactMessage>,
    private mailService: MailService,
  ) {}

  async create(data: { nom: string; prenom: string; email: string; sujet: string; message: string }) {
    const message = this.contactRepository.create({
      ...data,
      statut: 'non_lu'
    });
    const saved = await this.contactRepository.save(message);
    return saved;
  }

  async findAll() {
    return this.contactRepository.find({ order: { created_at: 'DESC' } });
  }

  async findOne(id: number) {
    const message = await this.contactRepository.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException(`Message avec l'ID ${id} non trouvé`);
    }
    return message;
  }

  async marquerCommeLu(id: number) {
    const message = await this.findOne(id);
    if (message.statut === 'non_lu') {
      message.statut = 'lu';
      await this.contactRepository.save(message);
    }
    return message;
  }

  async repondre(id: number, reponse: string, adminId: number) {
    const message = await this.findOne(id);
    
    message.reponse = reponse;
    message.statut = 'repondu';
    message.repondu_par = adminId;
    message.repondu_le = new Date();
    await this.contactRepository.save(message);

    // ENVOYER LE VRAI EMAIL
    await this.mailService.sendReplyEmail(
      message.email,
      message.sujet,
      message.message,
      reponse,
      `${message.prenom} ${message.nom}`,
    );

    return message;
  }

  async remove(id: number) {
    const message = await this.findOne(id);
    await this.contactRepository.remove(message);
  }

  async getStats() {
    const total = await this.contactRepository.count();
    const non_lu = await this.contactRepository.count({ where: { statut: 'non_lu' } });
    const lu = await this.contactRepository.count({ where: { statut: 'lu' } });
    const repondu = await this.contactRepository.count({ where: { statut: 'repondu' } });
    return { total, non_lu, lu, repondu };
  }
}