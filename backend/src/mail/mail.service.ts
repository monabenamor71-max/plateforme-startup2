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

  async sendModificationNotification(nom: string, email: string) {
    try {
      await this.transporter.sendMail({
        from: 'plateformebeh@gmail.com',
        to: 'plateformebeh@gmail.com',
        subject: 'Modification profil expert en attente',
        html: '<h2>Modification profil</h2><p><strong>Expert :</strong> ' + nom + '</p><p><strong>Email :</strong> ' + email + '</p><p>Connectez-vous a l espace admin pour valider.</p><a href="http://localhost:3000/dashboard/admin">Espace admin</a>',
      });
      console.log('Email modification envoye');
    } catch(e) { console.log('Email erreur:', e.message); }
  }

  // NOUVELLE MÉTHODE POUR LE MOT DE PASSE OUBLIÉ
  async sendResetPasswordEmail(email: string, token: string) {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: 'plateformebeh@gmail.com',
        to: email,
        subject: 'Réinitialisation de votre mot de passe - BEH',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <div style="background: #0A2540; color: #F7B500; width: 50px; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto; font-size: 20px; font-weight: bold;">BEH</div>
            </div>
            <h2 style="color: #0A2540; text-align: center;">Réinitialisation du mot de passe</h2>
            <p style="color: #64748B; text-align: center;">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #F7B500; color: #0A2540; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Réinitialiser mon mot de passe</a>
            </div>
            <p style="color: #94A3B8; font-size: 12px; text-align: center;">Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
            <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 20px 0;">
            <p style="color: #94A3B8; font-size: 11px; text-align: center;">Business Expert Hub - Plateforme de mise en relation</p>
          </div>
        `,
      });
      console.log('📧 Email de réinitialisation envoyé à:', email);
    } catch(e) { 
      console.log('❌ Erreur envoi email:', e.message); 
      console.log('🔗 LIEN DE RÉINITIALISATION (copiez ce lien) :', resetLink);
    }
  }
}