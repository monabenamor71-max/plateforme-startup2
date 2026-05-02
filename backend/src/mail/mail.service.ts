// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);
  private readonly adminEmail = 'plateformebeh@gmail.com';
  private readonly baseUrl: string;

  constructor() {
    // Variable d'environnement obligatoire pour la production
    // Par défaut, utilise localhost:3001 en développement
    this.baseUrl = process.env.APP_BASE_URL || 'http://localhost:3001';
    this.logger.log(`🌐 Base URL utilisée pour les liens dans les emails : ${this.baseUrl}`);

    // Utiliser un mot de passe d'application Gmail depuis variable d'environnement (recommandé)
    const emailPass = process.env.EMAIL_APP_PASS || 'eeby aygp htye hwvu';
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'plateformebeh@gmail.com',
        pass: emailPass,
      },
      tls: { rejectUnauthorized: false },
    });
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      this.logger.log('✅ Connexion SMTP établie avec succès');
    } catch (error) {
      this.logger.error(`❌ Échec SMTP : ${error.message}`);
    }
  }

  // ==================== TEMPLATE DE BASE ====================
  private getBaseHtml(content: string, button?: { url: string; text: string }) {
    const buttonHtml = button
      ? `<div style="text-align: center; margin: 30px 0;">
           <a href="${button.url}" style="background: #F7B500; color: #0A2540; padding: 12px 28px; text-decoration: none; border-radius: 30px; font-weight: 700; font-size: 14px; display: inline-block;">${button.text}</a>
         </div>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0; padding:0; background:#F0F4FA; font-family: 'Segoe UI', Helvetica, Arial, sans-serif;">
        <div style="max-width: 520px; margin: 40px auto; background: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px rgba(10,37,64,0.12);">
          <div style="background: #0A2540; padding: 28px 24px; text-align: center;">
            <div style="display: inline-block; background: #F7B500; width: 48px; height: 48px; border-radius: 12px; line-height: 48px; font-size: 20px; font-weight: 900; color: #0A2540;">BEH</div>
            <h1 style="margin: 16px 0 0; font-size: 20px; color: #FFFFFF; font-weight: 700;">Business Expert Hub</h1>
          </div>
          <div style="padding: 32px 32px 40px;">
            ${content}
            ${buttonHtml}
            <hr style="border: none; border-top: 1px solid #E8EEF6; margin: 32px 0 16px;">
            <p style="font-size: 12px; color: #8A9AB5; text-align: center;">Business Expert Hub – Accompagnement des startups par des experts certifiés</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ==================== ENVOI GÉNÉRIQUE ====================
  async sendEmail(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({
        from: '"BEH — Business Expert Hub" <plateformebeh@gmail.com>',
        to,
        subject,
        html,
      });
      this.logger.log(`✅ Email envoyé à ${to}`);
    } catch (error) {
      this.logger.error(`❌ Erreur envoi email à ${to} : ${error.message}`);
      throw error;
    }
  }

  // ==================== CONFIRMATION D'EMAIL ====================
  async sendConfirmationEmail(email: string, token: string) {
    const confirmLink = `${this.baseUrl}/auth/confirm?token=${token}`;
    console.log(`\n📧 LIEN DE CONFIRMATION pour ${email} :\n${confirmLink}\n`);
    this.logger.log(`Lien : ${confirmLink}`);

    const content = `
      <h2 style="color: #0A2540; font-size: 22px; margin-bottom: 12px;">Bienvenue sur BEH 🚀</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">Merci de vous être inscrit. Avant de continuer, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.</p>
      <p style="color: #64748B; font-size: 13px; margin-top: 20px;">Ce lien expire dans 24 heures.</p>
      <p style="margin-top: 20px; font-size: 13px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br/><a href="${confirmLink}" style="word-break: break-all;">${confirmLink}</a></p>
    `;

    const html = this.getBaseHtml(content, { url: confirmLink, text: '✅ Confirmer mon compte' });
    await this.sendEmail(email, 'Confirmation de votre adresse email', html);
  }

  // ==================== NOTIFICATION ADMIN ====================
  async sendAdminNotification(nom: string, role: string, email: string) {
    console.log(`🔔 NOUVELLE INSCRIPTION ${role.toUpperCase()} : ${nom} (${email})`);

    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 16px;">📋 Nouvelle inscription ${role === 'expert' ? 'Expert' : 'Startup'}</h2>
      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <p style="margin: 0 0 8px;"><strong style="color:#0A2540;">Nom :</strong> ${nom}</p>
        <p style="margin: 0;"><strong style="color:#0A2540;">Email :</strong> ${email}</p>
      </div>
      <p style="color:#475569;">Connectez-vous à l’espace administration pour valider ou refuser ce compte.</p>
    `;

    const adminDashboardUrl = `${this.baseUrl}/dashboard/admin`;
    const html = this.getBaseHtml(content, { url: adminDashboardUrl, text: '📊 Accéder à l’admin' });
    await this.sendEmail(this.adminEmail, `Nouvelle inscription ${role}`, html);
  }

  // ==================== VALIDATION DU COMPTE ====================
  async sendValidationEmail(nom: string, email: string) {
    const loginUrl = `${this.baseUrl}/connexion`;
    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 12px;">Félicitations, ${nom} ! 🎉</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">Votre compte a été validé par notre équipe. Vous pouvez désormais accéder à votre espace et profiter de toutes les fonctionnalités de BEH.</p>
    `;

    const html = this.getBaseHtml(content, { url: loginUrl, text: '🔑 Se connecter' });
    await this.sendEmail(email, '✅ Votre compte BEH est activé', html);
  }

  // ==================== REFUS DU COMPTE ====================
  async sendRefusEmail(nom: string, email: string) {
    const contactUrl = `${this.baseUrl}/contact`;
    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 12px;">Bonjour ${nom},</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">Nous avons examiné votre inscription. Malheureusement, elle n’a pas été retenue à ce stade. N’hésitez pas à nous recontacter pour plus d’informations.</p>
      <p style="color: #64748B; font-size: 13px;">L’équipe BEH reste à votre disposition.</p>
    `;

    const html = this.getBaseHtml(content, { url: contactUrl, text: '📞 Nous contacter' });
    await this.sendEmail(email, 'Votre inscription BEH', html);
  }

  // ==================== NOTIFICATION CONTACT ADMIN ====================
  async sendContactNotification(nom: string, prenom: string, email: string, sujet: string, message: string) {
    const adminContactsUrl = `${this.baseUrl}/dashboard/admin/contacts`;
    const content = `
      <h2 style="color: #0A2540; font-size: 20px; margin-bottom: 16px;">📩 Nouveau message de contact</h2>
      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <p><strong>Nom complet :</strong> ${prenom} ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>Sujet :</strong> ${sujet}</p>
        <p><strong>Message :</strong></p>
        <p style="background: white; padding: 12px; border-radius: 12px;">${message.replace(/\n/g, '<br>')}</p>
      </div>
      <p style="color:#475569;">Connectez-vous à l’espace administration pour consulter l’historique complet.</p>
    `;

    const html = this.getBaseHtml(content, { url: adminContactsUrl, text: '📋 Voir tous les messages' });
    await this.sendEmail(this.adminEmail, `📬 Nouveau message de contact - ${sujet}`, html);
  }

  // ==================== RÉPONSE AUX MESSAGES DE CONTACT ====================
  async sendReplyEmail(to: string, nom: string, reponse: string) {
    const content = `
      <h2 style="color: #0A2540;">Réponse de l'équipe BEH</h2>
      <p>Bonjour ${nom},</p>
      <div style="background: #F8FAFC; padding: 16px; border-radius: 12px; margin: 16px 0;">
        ${reponse.replace(/\n/g, '<br>')}
      </div>
      <p>Cordialement,<br/>L’équipe Business Expert Hub</p>
    `;
    const html = this.getBaseHtml(content);
    await this.sendEmail(to, 'Réponse à votre message', html);
  }

  // ==================== MODIFICATION DE PROFIL (admin) ====================
  async sendModificationNotification(nom: string, email: string) {
    const adminDashboardUrl = `${this.baseUrl}/dashboard/admin`;
    const content = `
      <h2 style="color: #0A2540; font-size: 20px;">✏️ Modification de profil demandée</h2>
      <div style="background: #F8FAFC; border-radius: 16px; padding: 20px; margin: 16px 0;">
        <p><strong>Expert :</strong> ${nom}</p>
        <p><strong>Email :</strong> ${email}</p>
      </div>
      <p>Connectez-vous à l’administration pour examiner et approuver ces modifications.</p>
    `;

    const html = this.getBaseHtml(content, { url: adminDashboardUrl, text: '🔧 Gérer la modification' });
    await this.sendEmail(this.adminEmail, '🔔 Modification de profil expert en attente', html);
  }

  // ==================== RÉINITIALISATION PAR CODE ====================
  async sendResetCodeEmail(email: string, code: string) {
    const content = `
      <h2 style="color: #0A2540; font-size: 20px;">Code de réinitialisation</h2>
      <p style="color: #475569;">Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code unique :</p>
      <div style="background: #F7F9FC; border-radius: 12px; padding: 14px; text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 4px; margin: 20px 0;">${code}</div>
      <p style="color: #64748B; font-size: 13px;">Ce code expire dans 15 minutes. Ne le partagez avec personne.</p>
    `;

    const html = this.getBaseHtml(content);
    await this.sendEmail(email, 'Code de réinitialisation BEH', html);
  }

  // ==================== RÉINITIALISATION PAR LIEN ====================
  async sendResetPasswordEmail(email: string, token: string) {
    const resetLink = `${this.baseUrl}/reset-password?token=${token}`;
    const content = `
      <h2 style="color: #0A2540;">Réinitialisation de votre mot de passe</h2>
      <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans 1 heure.</p>
      <p style="margin-top: 16px;">Si le bouton ne fonctionne pas, copiez ce lien : <br/><a href="${resetLink}">${resetLink}</a></p>
    `;

    const html = this.getBaseHtml(content, { url: resetLink, text: '🔐 Réinitialiser mon mot de passe' });
    await this.sendEmail(email, 'Réinitialisation mot de passe BEH', html);
  }
}