// src/auth/auth.service.ts
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
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
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async registerExpert(body: any, files: { cv: Express.Multer.File; photo: Express.Multer.File; portfolio?: Express.Multer.File }) {
    const { email, password, nom, prenom, telephone, domaine, annee_debut_experience, localisation, description } = body;

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) throw new BadRequestException('Email déjà utilisé');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepo.create({
      email,
      password: hashedPassword,
      nom,
      prenom,
      telephone: telephone || '',
      role: 'expert',
      statut: 'en_attente',
    });
    await this.userRepo.save(user);

    let anneeDebut: number | null = null;
    if (annee_debut_experience) {
      const parsed = parseInt(annee_debut_experience, 10);
      if (!isNaN(parsed)) anneeDebut = parsed;
    }

    const expert = this.expertRepo.create({
      user_id: user.id,
      domaine,
      annee_debut_experience: anneeDebut,   // ✅ null autorisé
      localisation: localisation || '',
      description: description || '',
      photo: files.photo?.filename,
      cv: files.cv?.filename,
      portfolio: files.portfolio?.filename,
      statut: 'en_attente',
    });
    await this.expertRepo.save(expert);

    try {
      console.log(`[Mail] Inscription expert: ${email}`);
    } catch(e) {}

    return { message: 'Inscription réussie, en attente de validation' };
  }

  async registerStartup(body: any) {
    const { email, password, nom, prenom, telephone, nom_startup, secteur, fonction, taille } = body;

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) throw new BadRequestException('Email déjà utilisé');

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
    await this.userRepo.save(user);

    const startup = this.startupRepo.create({
      user_id: user.id,
      nom_startup,
      secteur,
      fonction,
      taille,
      statut: 'en_attente',
    });
    await this.startupRepo.save(startup);

    try {
      console.log(`[Mail] Inscription startup: ${email}`);
    } catch(e) {}

    return { message: 'Inscription réussie, en attente de validation' };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new BadRequestException('Identifiants incorrects');
    if (!user.password) throw new BadRequestException('Identifiants incorrects');
    if (!await bcrypt.compare(password, user.password)) throw new BadRequestException('Identifiants incorrects');
    if (user.statut !== 'actif') throw new BadRequestException('Votre compte n\'est pas encore activé');

    const payload = { id: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);
    return { access_token: token, user: { id: user.id, email: user.email, role: user.role, prenom: user.prenom, nom: user.nom } };
  }

  async forgotPassword(email: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Aucun compte associé à cet email');
    const token = this.jwtService.sign({ id: user.id }, { expiresIn: '1h' });
    // À implémenter dans MailService si nécessaire
    console.log(`[Mail] Reset password pour ${email}, token: ${token}`);
    return { message: 'Email de réinitialisation envoyé' };
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userRepo.findOne({ where: { id: payload.id } });
      if (!user) throw new BadRequestException('Token invalide');
      user.password = await bcrypt.hash(newPassword, 10);
      await this.userRepo.save(user);
      return { message: 'Mot de passe réinitialisé' };
    } catch {
      throw new BadRequestException('Token invalide ou expiré');
    }
  }
}