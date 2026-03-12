import { Controller, Put, Body, Req, UseGuards } from '@nestjs/common';
import { ExpertsService } from './experts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('experts')
export class ExpertsController {
  constructor(private expertsService: ExpertsService) {}

  @UseGuards(JwtAuthGuard)
  @Put('profil')
  updateProfil(@Req() req: any, @Body() body: any) {
    return this.expertsService.updateProfil(req.user.id, body);
  }
}
