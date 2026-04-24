// backend/src/auth/auth.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as path from 'path';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { Startup } from '../user/startup.entity';
import { RegisterExpertDto } from './dto/register-expert.dto';
import { RegisterStartupDto } from './dto/register-startup.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
    @InjectRepository(Startup) private startupRepo: Repository<Startup>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  private extractFileName(filePath?: string): string | undefined {
    if (!filePath) return undefined;
    return path.basename(filePath);
  }

  async registerExpert(
    dto: RegisterExpertDto,
    photoPath?: string,
    cvPath?: string,
    portfolioPath?: string,
  ) {
    const { email, password, nom, prenom, telephone, domaine, annee_debut_experience, localisation, description } = dto;

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email déjà utilisé');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      nom,
      prenom,
      telephone: telephone || '',
      role: 'expert',
      statut: 'en_attente',
      photo: this.extractFileName(photoPath),
    });
    const savedUser = await this.userRepo.save(user);
    if (!savedUser || !savedUser.id) {
      throw new BadRequestException('Erreur lors de la création de l’utilisateur (aucun ID retourné)');
    }

    let anneeDebut: number | null = null;
    if (annee_debut_experience !== undefined && annee_debut_experience !== null) {
      anneeDebut = Number(annee_debut_experience);
      if (isNaN(anneeDebut)) anneeDebut = null;
    }

    const expert = this.expertRepo.create({
      user_id: savedUser.id,
      domaine: domaine || '',
      annee_debut_experience: anneeDebut,
      localisation: localisation || '',
      description: description || '',
      statut: 'en_attente',
      cv: this.extractFileName(cvPath),
      portfolio: this.extractFileName(portfolioPath),
    });
    const savedExpert = await this.expertRepo.save(expert);
    if (!savedExpert) {
      throw new BadRequestException('Erreur lors de la création du profil expert');
    }

    const confirmationToken = this.jwtService.sign(
      { id: savedUser.id, email },
      { expiresIn: '24h' }
    );
    savedUser.reset_code = confirmationToken;
    savedUser.email_verified = false;
    const updatedUser = await this.userRepo.save(savedUser);
    if (!updatedUser) {
      throw new BadRequestException('Erreur lors de la mise à jour du token de confirmation');
    }

    await this.mailService.sendConfirmationEmail(email, confirmationToken);
    await this.mailService.sendAdminNotification(`${prenom} ${nom}`, 'expert', email);

    return { message: 'Inscription réussie. Un email de confirmation vous a été envoyé.' };
  }

  async registerStartup(dto: RegisterStartupDto) {
    const { email, password, nom, prenom, telephone, nom_startup, secteur, fonction, taille, site_web, localisation, description } = dto;
    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) throw new BadRequestException('Email déjà utilisé');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      nom,
      prenom,
      telephone: telephone || '',
      role: 'startup',
      statut: 'en_attente',
    });
    const savedUser = await this.userRepo.save(user);
    if (!savedUser || !savedUser.id) {
      throw new BadRequestException('Erreur lors de la création de l’utilisateur startup (aucun ID retourné)');
    }

    const startup = this.startupRepo.create({
      user_id: savedUser.id,
      nom_startup,
      secteur,
      fonction,
      taille,
      site_web,
      localisation,
      description,
      statut: 'en_attente',
    });
    const savedStartup = await this.startupRepo.save(startup);
    if (!savedStartup) {
      throw new BadRequestException('Erreur lors de la création du profil startup');
    }

    const confirmationToken = this.jwtService.sign(
      { id: savedUser.id, email },
      { expiresIn: '24h' }
    );
    savedUser.reset_code = confirmationToken;
    savedUser.email_verified = false;
    const updatedUser = await this.userRepo.save(savedUser);
    if (!updatedUser) {
      throw new BadRequestException('Erreur lors de la mise à jour du token de confirmation');
    }

    await this.mailService.sendConfirmationEmail(email, confirmationToken);
    await this.mailService.sendAdminNotification(`${prenom} ${nom} (${nom_startup})`, 'startup', email);

    return { message: 'Inscription réussie. Un email de confirmation vous a été envoyé.' };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Identifiants incorrects');
    if (!await bcrypt.compare(password, user.password)) throw new BadRequestException('Identifiants incorrects');
    if (user.statut !== 'actif') throw new BadRequestException('Compte non activé par l’administrateur');
    if (!user.email_verified) throw new BadRequestException('Veuillez confirmer votre adresse email avant de vous connecter');
    const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });
    return { access_token: token, user: { id: user.id, email: user.email, role: user.role, prenom: user.prenom, nom: user.nom } };
  }

  async confirmEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepo.findOne({ where: { id: payload.id } });
      if (!user) throw new BadRequestException('Utilisateur non trouvé');
      if (user.email_verified) throw new BadRequestException('Email déjà confirmé');
      user.email_verified = true;
      user.reset_code = '';
      const updatedUser = await this.userRepo.save(user);
      if (!updatedUser) {
        throw new BadRequestException('Erreur lors de la mise à jour de la confirmation email');
      }
      return { message: 'Email confirmé avec succès. Vous pouvez maintenant vous connecter.' };
    } catch (err) {
      throw new BadRequestException('Lien de confirmation invalide ou expiré');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Aucun compte associé à cet email');

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 15);

    user.reset_code = resetCode;
    user.reset_code_expires = expires;
    const updatedUser = await this.userRepo.save(user);
    if (!updatedUser) {
      throw new BadRequestException('Erreur lors de l’enregistrement du code de réinitialisation');
    }

    await this.mailService.sendResetCodeEmail(email, resetCode);

    return { message: 'Un code de réinitialisation a été envoyé à votre adresse email.' };
  }

  async resetPasswordWithCode(email: string, code: string, newPassword: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Email invalide');

    if (user.reset_code !== code) throw new BadRequestException('Code incorrect.');
    if (!user.reset_code_expires || user.reset_code_expires < new Date()) {
      throw new BadRequestException('Code expiré, veuillez refaire une demande.');
    }

    if (newPassword.length < 6) throw new BadRequestException('Le mot de passe doit contenir au moins 6 caractères');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.reset_code = '';
    user.reset_code_expires = new Date(0);
    const updatedUser = await this.userRepo.save(user);
    if (!updatedUser) {
      throw new BadRequestException('Erreur lors de la réinitialisation du mot de passe');
    }

    return { message: 'Mot de passe réinitialisé avec succès.' };
  }

  async resetPassword(token: string, newPassword: string) {
    throw new BadRequestException('Utilisez la méthode avec code à 6 chiffres');
  }
}