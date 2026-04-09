import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Newsletter } from './newsletter.entity';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NewsletterService {
  private transporter: any;

  constructor(
    @InjectRepository(Newsletter)
    private repo: Repository<Newsletter>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: 'plateformebeh@gmail.com', pass: 'cqebabwfpamtudhb' },
      tls: { rejectUnauthorized: false },
    });
  }

  async subscribe(email: string, nom?: string) {
    try {
      let sub = await this.repo.findOne({ where: { email } });
      if (sub) {
        if (!sub.actif) {
          await this.repo.update(sub.id, { actif: true });
          sub.actif = true;
        }
        return { success: true, message: 'Deja inscrit', alreadyExists: true };
      }
      sub = this.repo.create({ email, nom, actif: true });
      await this.repo.save(sub);

      // Email de bienvenue
      try {
        await this.transporter.sendMail({
          from: 'plateformebeh@gmail.com',
          to: email,
          subject: 'Bienvenue dans la newsletter BEH !',
          html: '<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#0A2540;padding:24px;border-radius:12px 12px 0 0"><h2 style="color:#F7B500;margin:0">Bienvenue chez Business Expert Hub</h2></div><div style="padding:24px;background:#F7F9FC;border-radius:0 0 12px 12px"><p>Bonjour <strong>' + (nom || email) + '</strong>,</p><p>Vous etes maintenant inscrit a notre newsletter. Vous recevrez toutes nos actualites, nouveaux experts, formations et opportunites.</p><p style="color:#8A9AB5;font-size:13px">- L equipe BEH</p></div></div>',
        });
      } catch (e) { console.log('Email bienvenue erreur:', e.message); }

      // Email notification admin
      try {
        await this.transporter.sendMail({
          from: 'plateformebeh@gmail.com',
          to: 'plateformebeh@gmail.com',
          subject: '[BEH] Nouvelle inscription newsletter : ' + email,
          html: '<p>Nouvel abonne newsletter : <strong>' + email + '</strong>' + (nom ? ' (' + nom + ')' : '') + '</p>',
        });
      } catch (e) {}

      return { success: true, message: 'Inscription reussie' };
    } catch (e) {
      return { success: false, message: 'Erreur inscription' };
    }
  }

  async unsubscribe(email: string) {
    await this.repo.update({ email }, { actif: false });
    return { success: true };
  }

  getAll() {
    return this.repo.find({ where: { actif: true }, order: { createdAt: 'DESC' } });
  }

  async sendNewsletter(sujet: string, contenu: string) {
    const abonnes = await this.repo.find({ where: { actif: true } });
    let sent = 0;
    for (const a of abonnes) {
      try {
        await this.transporter.sendMail({
          from: 'plateformebeh@gmail.com',
          to: a.email,
          subject: sujet,
          html: '<div style="font-family:sans-serif;max-width:600px;margin:0 auto"><div style="background:#0A2540;padding:24px;border-radius:12px 12px 0 0"><h2 style="color:#F7B500;margin:0">Business Expert Hub</h2></div><div style="padding:24px">' + contenu + '<hr style="border:none;border-top:1px solid #E8EEF6;margin:24px 0"/><p style="font-size:12px;color:#8A9AB5">Pour se desabonner, <a href="http://localhost:3000/newsletter/unsubscribe?email=' + a.email + '">cliquez ici</a></p></div></div>',
        });
        sent++;
      } catch (e) {}
    }
    return { success: true, sent, total: abonnes.length };
  }
}
