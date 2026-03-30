import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register/expert')
  @UseInterceptors(FileInterceptor('cv'))
  registerExpert(@Body() body: any, @UploadedFile() file: any) {
    return this.authService.registerExpert(body, file);
  }

  @Post('register/startup')
  registerStartup(@Body() body: any) {
    return this.authService.registerStartup(body);
  }

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }
}