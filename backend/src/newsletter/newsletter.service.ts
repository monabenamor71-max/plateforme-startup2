// src/newsletter/newsletter.service.ts
import { Injectable, BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Newsletter } from './newsletter.entity';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { MailService } from '../mail/mail.service';

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

  constructor(
    @InjectRepository(Newsletter)
    private repo: Repository<Newsletter>,
    private mailService: MailService,
  ) {}

  async subscribe(dto: SubscribeNewsletterDto) {
    const { email, nom } = dto;
    try {
      let sub = await this.repo.findOne({ where: { email } });
      if (sub) {
        if (!sub.actif) {
          const updateResult = await this.repo.update(sub.id, { actif: true });
          if (updateResult.affected === 0) {
            throw new BadRequestException('Impossible de réactiver l’abonnement');
          }
          this.logger.log(`Abonné ${email} réactivé`);
          return { success: true, message: 'Inscription réactivée' };
        }
        return { success: true, message: 'Déjà inscrit', alreadyExists: true };
      }

      const newSub = this.repo.create({ email, nom, actif: true });
      const saved = await this.repo.save(newSub);
      if (!saved || !saved.id) {
        throw new BadRequestException('Erreur lors de la sauvegarde de l’abonné');
      }
      this.logger.log(`Nouvel abonné newsletter : ${email}`);

      // Envoi de l'email de bienvenue
      await this.sendWelcomeEmail(email, nom).catch(err =>
        this.logger.error(`Erreur envoi email bienvenue à ${email} : ${err.message}`)
      );

      // Notification admin
      await this.notifyAdminNewSubscription(email, nom).catch(err =>
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
    await this.mailService.sendEmail(email, 'Bienvenue dans la newsletter BEH !', html);
  }

  private async notifyAdminNewSubscription(email: string, nom?: string) {
    const html = `<p>Nouvel abonné newsletter : <strong>${email}</strong>${nom ? ` (${nom})` : ''}</p>`;
    const adminEmail = process.env.ADMIN_EMAIL || 'plateformebeh@gmail.com';
    await this.mailService.sendEmail(adminEmail, '[BEH] Nouvelle inscription newsletter', html);
  }

  async unsubscribe(dto: UnsubscribeDto) {
    const { email } = dto;
    const abonne = await this.repo.findOne({ where: { email } });
    if (!abonne) throw new NotFoundException('Email non trouvé');
    if (!abonne.actif) return { success: true, message: 'Déjà désabonné' };

    const updateResult = await this.repo.update({ email }, { actif: false });
    if (updateResult.affected === 0) {
      throw new BadRequestException('Impossible de désabonner cet email');
    }
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
        const html = `<div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#0A2540;padding:24px;border-radius:12px 12px 0 0">
            <h2 style="color:#F7B500;margin:0">Business Expert Hub</h2>
          </div>
          <div style="padding:24px">${contenu}<hr style="border:none;border-top:1px solid #E8EEF6;margin:24px 0"/>
          <p style="font-size:12px;color:#8A9AB5">Pour vous désabonner, <a href="http://localhost:3000/newsletter/unsubscribe?email=${a.email}">cliquez ici</a></p>
          </div>
        </div>`;
        await this.mailService.sendEmail(a.email, sujet, html);
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
    const deleteResult = await this.repo.delete({ email });
    if (deleteResult.affected === 0) {
      throw new BadRequestException('Impossible de supprimer cet abonné');
    }
    this.logger.log(`Abonné supprimé : ${email}`);
    return { success: true };
  }
}