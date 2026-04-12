import { Controller, Get, Post, Put, Patch, Delete, Body, Param, UseInterceptors, UploadedFile, UseGuards, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FormationsService } from './formations.service';

// Si vous avez un guard JWT, décommentez la ligne suivante
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('formations')
export class FormationsController {
  constructor(private formationsService: FormationsService) {}

  // ✅ Route pour qu'un expert propose une formation
  @Post('services-plateforme/expert/proposer')
  // @UseGuards(JwtAuthGuard)   // Décommentez si vous avez un guard
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/formations',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `formation-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
async proposerParExpert(@Body() body: any, @UploadedFile() file: any, @Request() req: any) {
  // Récupération de l'ID de l'expert (temporairement fixe)
  // const expertId = req.user?.expertId;
  const expertId = 1; // ID d'un expert valide dans votre base
  if (!expertId) throw new Error('Expert non authentifié');
  return this.formationsService.createFromExpert(body, file, expertId);
}
@Get('expert/mes-formations')
async getMesFormations(@Request() req: any) {
  const expertId = 1; // fixe pour test
  return this.formationsService.findByExpert(expertId);
}

  // --- Routes ADMIN ---
  @Post('admin/create')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/formations',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `formation-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async create(@Body() body: any, @UploadedFile() file: any) {
    return this.formationsService.create(body, file);
  }

  @Get('admin/all')
  async findAll() {
    return this.formationsService.findAll();
  }

  @Get('public')
  async findPublished() {
    return this.formationsService.findPublished();
  }

  @Get('public/:id')
  async findOne(@Param('id') id: number) {
    return this.formationsService.findOne(id);
  }

  @Put('admin/:id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads/formations',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `formation-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async update(@Param('id') id: number, @Body() body: any, @UploadedFile() file: any) {
    return this.formationsService.update(id, body, file);
  }

  @Patch('admin/:id/statut')
  async updateStatut(@Param('id') id: number, @Body('statut') statut: string) {
    return this.formationsService.updateStatut(id, statut);
  }

  @Delete('admin/:id')
  async delete(@Param('id') id: number) {
    return this.formationsService.delete(id);
  }
  
}