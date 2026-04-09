import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContactMessage } from './contact-message.entity';
import { ContactConfig } from './contact-config.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  private transporter: any;

  constructor(
    @InjectRepository(ContactMessage) private msgRepo: Repository<ContactMessage>,
    @InjectRepository(ContactConfig) private cfgRepo: Repository<ContactConfig>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'plateformebeh@gmail.com',
        pass: 'cqebabwfpamtudhb',
      },
      tls: { rejectUnauthorized: false },
    });
  }

  async sendMessage(data: any) {
    const msg = this.msgRepo.create({ ...data, statut: 'non_lu' });
    await this.msgRepo.save(msg);

    try {
      await this.transporter.sendMail({
        from: 'plateformebeh@gmail.com',
        to: 'plateformebeh@gmail.com',
        subject: '[BEH Contact] ' + data.sujet + ' - ' + data.prenom + ' ' + data.nom,
        html: '<div style=\"font-family:sans-serif;max-width:600px;margin:0 auto\"><div style=\"background:#0A2540;padding:24px;border-radius:12px 12px 0 0\"><h2 style=\"color:#F7B500;margin:0\">Nouveau message de contact</h2></div><div style=\"background:#F7F9FC;padding:24px;border-radius:0 0 12px 12px;border:1px solid #E8EEF6\"><p><strong>Nom :</strong> ' + data.prenom + ' ' + data.nom + '</p><p><strong>Email :</strong> ' + data.email + '</p><p><strong>Telephone :</strong> ' + (data.telephone || '-') + '</p><p><strong>Sujet :</strong> ' + data.sujet + '</p><hr style=\"border:none;border-top:1px solid #E8EEF6\"/><p><strong>Message :</strong></p><div style=\"background:white;padding:16px;border-radius:8px;border:1px solid #E8EEF6\">' + data.message + '</div></div></div>',
      });
    } catch (e) { console.log('Email admin erreur:', e.message); }

    try {
      await this.transporter.sendMail({
        from: 'plateformebeh@gmail.com',
        to: data.email,
        subject: 'Nous avons recu votre message - Business Expert Hub',
        html: '<div style=\"font-family:sans-serif;max-width:600px;margin:0 auto\"><div style=\"background:#0A2540;padding:24px;border-radius:12px 12px 0 0\"><h2 style=\"color:#F7B500;margin:0\">Message recu</h2></div><div style=\"padding:24px\"><p>Bonjour <strong>' + data.prenom + '</strong>,</p><p>Nous avons bien recu votre message et vous repondrons dans un delai de 24h.</p><p style=\"color:#8A9AB5;font-size:13px\">- L equipe Business Expert Hub</p></div></div>',
      });
    } catch (e) { console.log('Email confirmation erreur:', e.message); }

    return { success: true, message: 'Message envoye' };
  }

  getAllMessages() {
    return this.msgRepo.find({ order: { createdAt: 'DESC' } });
  }

  getMessage(id: number) {
    return this.msgRepo.findOne({ where: { id } });
  }

  async marquerLu(id: number) {
    await this.msgRepo.update(id, { statut: 'lu' });
    return this.msgRepo.findOne({ where: { id } });
  }

  async repondre(id: number, reponse: string) {
    const msg = await this.msgRepo.findOne({ where: { id } });
    if (!msg) return { error: 'Non trouve' };

    await this.msgRepo.update(id, {
      statut: 'repondu',
      reponse_admin: reponse,
      repondu_le: new Date(),
    });

    try {
      await this.transporter.sendMail({
        from: 'plateformebeh@gmail.com',
        to: msg.email,
        subject: 'Reponse a votre message - Business Expert Hub',
        html: '<div style=\"font-family:sans-serif;max-width:600px;margin:0 auto\"><div style=\"background:#0A2540;padding:24px;border-radius:12px 12px 0 0\"><h2 style=\"color:#F7B500;margin:0\">Reponse de notre equipe</h2></div><div style=\"padding:24px\"><p>Bonjour <strong>' + msg.prenom + ' ' + msg.nom + '</strong>,</p><p>Votre sujet : <em>' + msg.sujet + '</em></p><div style=\"background:#F7F9FC;padding:16px;border-radius:8px;border-left:4px solid #F7B500\">' + reponse + '</div><p style=\"color:#8A9AB5;font-size:13px;margin-top:24px\">- L equipe Business Expert Hub</p></div></div>',
      });
    } catch (e) { console.log('Email reponse erreur:', e.message); }

    return { success: true };
  }

  async archiverMessage(id: number) {
    await this.msgRepo.update(id, { statut: 'archive' });
    return { message: 'Archive' };
  }

  async supprimerMessage(id: number) {
    await this.msgRepo.delete(id);
    return { message: 'Supprime' };
  }

  async getConfig() {
    let cfg = await this.cfgRepo.findOne({ where: { id: 1 } });
    if (!cfg) {
      cfg = this.cfgRepo.create({
        id: 1,
        email: 'plateformebeh@gmail.com',
        telephone: '+216 71 000 000',
        adresse: 'Lac 2, Tunis, Tunisie',
        horaires: 'Lun-Ven : 9h-18h | Sam : 9h-13h',
        description_hero: 'Notre equipe est disponible pour repondre a toutes vos questions.',
        facebook: '#',
        linkedin: '#',
        instagram: '#',
        whatsapp: '#',
      });
      await this.cfgRepo.save(cfg);
    }
    return cfg;
  }

  async updateConfig(data: any) {
    await this.cfgRepo.save({ ...data, id: 1 });
    return this.getConfig();
  }
}
