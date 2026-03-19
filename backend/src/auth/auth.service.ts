import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
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
    const existing = await this.usersService.findByEmail(userData.email);
    if (existing) throw new BadRequestException('Email déjà utilisé');

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await this.usersService.create({
      ...userData,
      password: hashedPassword,
      role,
    });

    if (role === UserRole.EXPERT) {
      await this.expertsService.create(user.id, profileData || {});
    } else if (role === UserRole.STARTUP) {
      await this.startupsService.create(user.id, profileData || {});
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return { access_token: this.jwtService.sign(payload), user };
  }
}