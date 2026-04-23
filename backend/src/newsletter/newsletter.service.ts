import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Newsletter } from './newsletter.entity';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

// DTO définis localement
export class SubscribeDto {
  email: string;
  nom?: string;
}

export class UnsubscribeDto {
  email: string;
}

export class SendNewsletterDto {
  sujet: string;
  contenu: string;
}

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectRepository(Newsletter)
    private repo: Repository<Newsletter>,
    private configService: ConfigService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
      tls: { rejectUnauthorized: false },
    });
  }

  async subscribe(dto: SubscribeDto) {
    const { email, nom } = dto;
    // ... (reste identique à la version précédente)
    // Je copie le corps complet depuis la dernière version corrigée
    try {
      let sub = await this.repo.findOne({ where: { email } });
      if (sub) {
        if (!sub.actif) {
          await this.repo.update(sub.id, { actif: true });
          this.logger.log(`Abonné ${email} réactivé`);
          return { success: true, message: 'Inscription réactivée' };
        }
        return { success: true, message: 'Déjà inscrit', alreadyExists: true };
      }

      sub = this.repo.create({ email, nom, actif: true });
      await this.repo.save(sub);
      this.logger.log(`Nouvel abonné newsletter : ${email}`);

      this.sendWelcomeEmail(email, nom).catch(err =>
        this.logger.error(`Erreur envoi email bienvenue à ${email} : ${err.message}`)
      );
      this.notifyAdminNewSubscription(email, nom).catch(err =>
        this.logger.error(`Erreur notification admin pour ${email} : ${err.message}`)
      );

      return { success: true, message: 'Inscription réussie' };
    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription ${email} : ${error.message}`);
      throw new BadRequestException("Erreur lors de l'inscription à la newsletter");
    }
  }

  private async sendWelcomeEmail(email: string, nom?: string) {
    const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0A2540;padding:24px;border-radius:12px 12px 0 0">
        <h2 style="color:#F7B500;margin:0">Bienvenue chez Business Expert Hub</h2>
      </div>
      <div style="padding:24px;background:#F7F9FC;border-radius:0 0 12px 12px">
        <p>Bonjour <strong>${nom || email}</strong>,</p>
        <p>Vous êtes maintenant inscrit à notre newsletter. Vous recevrez toutes nos actualités, nouveaux experts, formations et opportunités.</p>
        <p style="color:#8A9AB5;font-size:13px">- L'équipe BEH</p>
      </div>
    </div>`;
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: email,
      subject: 'Bienvenue dans la newsletter BEH !',
      html,
    });
  }

  private async notifyAdminNewSubscription(email: string, nom?: string) {
    const html = `<p>Nouvel abonné newsletter : <strong>${email}</strong>${nom ? ` (${nom})` : ''}</p>`;
    await this.transporter.sendMail({
      from: this.configService.get('EMAIL_FROM'),
      to: this.configService.get('ADMIN_EMAIL'),
      subject: '[BEH] Nouvelle inscription newsletter',
      html,
    });
  }

  async unsubscribe(dto: UnsubscribeDto) {
    const { email } = dto;
    const abonne = await this.repo.findOne({ where: { email } });
    if (!abonne) throw new NotFoundException('Email non trouvé');
    if (!abonne.actif) return { success: true, message: 'Déjà désabonné' };

    await this.repo.update({ email }, { actif: false });
    this.logger.log(`Désabonné : ${email}`);
    return { success: true, message: 'Désabonnement effectué' };
  }

  async getAll() {
    return this.repo.find({ where: { actif: true }, order: { createdAt: 'DESC' } });
  }

  async sendNewsletter(dto: SendNewsletterDto) {
    const { sujet, contenu } = dto;
    const abonnes = await this.repo.find({ where: { actif: true } });
    if (abonnes.length === 0) throw new BadRequestException('Aucun abonné actif');

    let sent = 0;
    for (const a of abonnes) {
      try {
        await this.transporter.sendMail({
          from: this.configService.get('EMAIL_FROM'),
          to: a.email,
          subject: sujet,
          html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#0A2540;padding:24px;border-radius:12px 12px 0 0">
              <h2 style="color:#F7B500;margin:0">Business Expert Hub</h2>
            </div>
            <div style="padding:24px">${contenu}<hr style="border:none;border-top:1px solid #E8EEF6;margin:24px 0"/>
            <p style="font-size:12px;color:#8A9AB5">Pour vous désabonner, <a href="http://localhost:3000/newsletter/unsubscribe?email=${a.email}">cliquez ici</a></p>
            </div>
          </div>`,
        });
        sent++;
        this.logger.log(`Newsletter envoyée à ${a.email}`);
      } catch (err) {
        this.logger.error(`Erreur envoi newsletter à ${a.email} : ${err.message}`);
      }
    }
    this.logger.log(`Newsletter envoyée à ${sent}/${abonnes.length} abonnés`);
    return { success: true, sent, total: abonnes.length };
  }

  async removeByEmail(email: string) {
    const abonne = await this.repo.findOne({ where: { email } });
    if (!abonne) throw new NotFoundException('Email non trouvé');
    await this.repo.delete({ email });
    this.logger.log(`Abonné supprimé : ${email}`);
    return { success: true };
  }
}