import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { RendezVousService } from './rendez-vous.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRendezVousDto, UpdateRendezVousDto } from './dto/rendez-vous.dto';

@Controller('rendez-vous')
export class RendezVousController {
  constructor(private rdvService: RendezVousService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body(ValidationPipe) createDto: CreateRendezVousDto, @Request() req: any) {
    return this.rdvService.createRdv(createDto, req.user.id);
  }

  @Get('expert')
  @UseGuards(JwtAuthGuard)
  getByExpert(@Request() req: any) {
    return this.rdvService.getByExpert(req.user.id);
  }

  @Get('startup')
  @UseGuards(JwtAuthGuard)
  getByClient(@Request() req: any) {
    return this.rdvService.getByClient(req.user.id);
  }

  @Put(':id/confirmer')
  @UseGuards(JwtAuthGuard)
  confirmer(@Param('id', ParseIntPipe) id: number) {
    return this.rdvService.confirmer(id);
  }

  @Put(':id/annuler')
  @UseGuards(JwtAuthGuard)
  annuler(@Param('id', ParseIntPipe) id: number) {
    return this.rdvService.annuler(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateDto: UpdateRendezVousDto,
    @Request() req: any,
  ) {
    return this.rdvService.updateRdv(id, updateDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.rdvService.deleteRdv(id, req.user.id);
  }
}