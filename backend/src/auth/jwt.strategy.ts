// jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'secret123',
    });
  }

  async validate(payload: any) {
    // payload doit contenir 'id' (l'ID de l'utilisateur/expert)
    return {
      id: payload.id,          // ← c'est ce qui sera dans req.user.id
      email: payload.email,
      role: payload.role,
    };
  }
}