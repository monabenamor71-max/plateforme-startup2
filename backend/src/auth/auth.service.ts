import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/user.entity';
import { ExpertsService } from '../experts/experts.service';
import { StartupsService } from '../startups/startups.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private expertsService: ExpertsService,
    private startupsService: StartupsService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _pw, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Identifiants invalides');
    const payload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(payload), user };
  }

  async register(userData: any, role: UserRole, profileData?: any) {
    console.log('=== AuthService.register appelé ===');
    console.log('email:', userData.email, '| role:', role);
    console.log('profileData:', profileData);

    // 1. Vérifier email unique
    const existing = await this.usersService.findByEmail(userData.email);
    if (existing) throw new BadRequestException('Email déjà utilisé');

    // 2. Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // 3. Créer l'utilisateur
    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
      role,
    });

    console.log('✅ Utilisateur créé — id:', user.id, '| role:', user.role);

    // 4. Créer le profil selon le rôle
    if (role === UserRole.EXPERT) {
      console.log('→ Création profil EXPERT pour user id:', user.id);
      try {
        await this.expertsService.create(user.id, profileData || {});
        console.log('✅ Profil expert créé');
      } catch (err) {
        console.error('❌ Erreur création expert:', err.message);
        throw err;
      }
    } else if (role === UserRole.STARTUP) {
      console.log('→ Création profil STARTUP pour user id:', user.id);
      try {
        await this.startupsService.create(user.id, profileData || {});
        console.log('✅ Profil startup créé');
      } catch (err) {
        console.error('❌ Erreur création startup:', err.message);
        throw err;
      }
    }

    // 5. Générer token JWT
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}