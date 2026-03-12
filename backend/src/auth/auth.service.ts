import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { Expert } from '../experts/expert.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Expert)
    private expertRepository: Repository<Expert>,
    private jwtService: JwtService,
  ) {}

  async register(
    nom: string, prenom: string, tel: string,
    email: string, password: string,
    role: string, domaine?: string
  ) {
    // Vérifier si email existe déjà
    const existe = await this.userRepository.findOne({ where: { email } });
    if (existe) throw new ConflictException('Email déjà utilisé');

    // Chiffrer le mot de passe
    const hash = await bcrypt.hash(password, 10);

    // Sauvegarder dans users
    const user = this.userRepository.create({
      nom, prenom, tel, email,
      password: hash, role, domaine,
    });
    const savedUser = await this.userRepository.save(user);
    console.log('User créé:', savedUser.id);

    // Si expert → sauvegarder dans experts aussi
    if (role === 'expert') {
      const expert = this.expertRepository.create({
        user_id: savedUser.id,
        domaine: domaine || '',
        valide: false,
      });
      const savedExpert = await this.expertRepository.save(expert);
      console.log('Expert créé:', savedExpert.id);
    }

    return { message: 'Inscription réussie ✅' };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Email incorrect');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Mot de passe incorrect');
    const token = this.jwtService.sign({
      id: user.id,
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
    });
    return { token, message: 'Connexion réussie ✅' };
  }
}
