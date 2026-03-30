import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'plateformebeh@gmail.com',
      pass: 'cqebabwfpamtudhb',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  async sendAdminNotification(nom, role, email) {
    try {
      await this.transporter.sendMail({
        from: 'plateformebeh@gmail.com',
        to: 'plateformebeh@gmail.com',
        subject: 'Nouvelle inscription ' + role,
        html: '<h2>Inscription ' + role + '</h2><p>Nom: ' + nom + '</p><p>Email: ' + email + '</p>',
      });
      console.log('Email admin OK');
    } catch(e) { console.log('ERREUR:', e.message); }
  }

  async sendValidationEmail(nom, email) {
    try {
      await this.transporter.sendMail({
        from: 'plateformebeh@gmail.com',
        to: email,
        subject: 'Compte BEH valide',
        html: '<h2>Bonjour ' + nom + '</h2><p>Votre compte est valide.</p><a href="http://localhost:3000/connexion">Se connecter</a>',
      });
      console.log('Email validation OK a:', email);
    } catch(e) { console.log('ERREUR:', e.message); }
  }

  async sendRefusEmail(nom, email) {
    try {
      await this.transporter.sendMail({
        from: 'plateformebeh@gmail.com',
        to: email,
        subject: 'Compte BEH refuse',
        html: '<h2>Bonjour ' + nom + '</h2><p>Votre demande est refusee.</p>',
      });
      console.log('Email refus OK a:', email);
    } catch(e) { console.log('ERREUR:', e.message); }
  }
}