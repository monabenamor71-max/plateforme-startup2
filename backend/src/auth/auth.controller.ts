import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(
    @Body() body: {
      nom: string;
      prenom: string;
      tel: string;
      email: string;
      password: string;
      role: string;
      domaine?: string;
    },
  ) {
    return this.authService.register(
      body.nom,
      body.prenom,
      body.tel,
      body.email,
      body.password,
      body.role,
      body.domaine,
    );
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}