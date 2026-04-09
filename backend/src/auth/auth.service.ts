import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User } from '../user/user.entity';
import { Expert } from '../user/expert.entity';
import { Startup } from '../user/startup.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Expert) private expertRepo: Repository<Expert>,
    @InjectRepository(Startup) private startupRepo: Repository<Startup>,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  async registerExpert(body: any, files?: any) {
    const existe = await this.userRepo.findOne({ where: { email: body.email } });
    if (existe) throw new BadRequestException('Email deja utilise');
    const hash = await bcrypt.hash(body.password, 10);
    const user = this.userRepo.create({
      nom: body.nom,
      prenom: body.prenom,
      telephone: body.telephone,
      email: body.email,
      mot_de_passe: hash,
      role: 'expert',
      statut: 'en_attente',
    });
    const savedUser = await this.userRepo.save(user);
    
    const expert = this.expertRepo.create({
      user_id: savedUser.id,
      domaine: body.domaine,
      description: body.description,
      experience: body.experience,
      localisation: body.localisation,
      disponibilite: body.disponibilite,
      telephone: body.telephone,
      cv: files?.cv?.filename || null,
      photo: files?.photo?.filename || null,
      portfolio: files?.portfolio?.filename || null,
      statut: 'en_attente',
    });
    await this.expertRepo.save(expert);
    
    try {
      await this.mailService.sendAdminNotification(
        body.prenom + ' ' + body.nom, 'Expert', body.email
      );
    } catch (e) {
      console.log('Email non envoyé:', e.message);
    }
    return { message: 'Inscription reussie ! En attente de validation.' };
  }

  async registerStartup(body: any) {
    const existe = await this.userRepo.findOne({ where: { email: body.email } });
    if (existe) throw new BadRequestException('Email deja utilise');
    const hash = await bcrypt.hash(body.password, 10);
    const user = this.userRepo.create({
      nom: body.nom,
      prenom: body.prenom,
      telephone: body.telephone,
      email: body.email,
      mot_de_passe: hash,
      role: 'startup',
      statut: 'en_attente',
    });
    const savedUser = await this.userRepo.save(user);
    const startup = this.startupRepo.create({
      user_id: savedUser.id,
      nom_startup: body.nom_startup,
      secteur: body.secteur,
      taille: body.taille,
      fonction: body.fonction,
      statut: 'en_attente',
    });
    await this.startupRepo.save(startup);
    try {
      await this.mailService.sendAdminNotification(
        body.prenom + ' ' + body.nom, 'Startup', body.email
      );
    } catch (e) {
      console.log('Email non envoyé:', e.message);
    }
    return { message: 'Inscription reussie ! En attente de validation.' };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Email ou mot de passe incorrect');
    const valid = await bcrypt.compare(password, user.mot_de_passe);
    if (!valid) throw new BadRequestException('Email ou mot de passe incorrect');
    if (user.statut === 'en_attente') throw new BadRequestException('Compte en attente de validation');
    if (user.statut === 'inactif') throw new BadRequestException('Compte desactive');
    const token = this.jwtService.sign({ id: user.id, email: user.email, role: user.role });
    return {
      access_token: token,
      user: { id: user.id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role },
    };
  }

  // ============================================
  // MOT DE PASSE OUBLIÉ
  // ============================================

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    
    if (!user) {
      return { success: true, message: "Si cet email existe, un lien a été envoyé" };
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);
    
    user.reset_token = token;
    user.reset_token_expires = expires;
    await this.userRepo.save(user);
    
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    console.log("=========================================");
    console.log("🔗 LIEN DE RÉINITIALISATION :");
    console.log(resetLink);
    console.log("=========================================");
    
    // Essayer d'envoyer l'email (optionnel)
    try {
      if (this.mailService.sendResetPasswordEmail) {
        await this.mailService.sendResetPasswordEmail(email, token);
      }
    } catch (e) {
      console.log('Email non envoyé, lien disponible dans la console');
    }
    
    return { success: true, message: "Un lien de réinitialisation a été envoyé" };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.userRepo.findOne({
      where: { reset_token: token },
    });
    
    if (!user) {
      throw new BadRequestException('Lien invalide ou expiré');
    }
    
    if (user.reset_token_expires && new Date() > user.reset_token_expires) {
      throw new BadRequestException('Le lien a expiré');
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    user.mot_de_passe = hashedPassword;
    user.reset_token = '';
user.reset_token_expires = undefined as any;
    await this.userRepo.save(user);
    
    return { success: true, message: "Mot de passe réinitialisé avec succès" };
  }
}