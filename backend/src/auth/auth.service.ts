import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
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

  async registerExpert(body: any, file?: any) {
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
    cv: file ? file.originalname : null,
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
return { message: 'Inscription reussie ! En attente de validation.' };}

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
return { message: 'Inscription reussie ! En attente de validation.' };}
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
}