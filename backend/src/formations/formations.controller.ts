// src/formations/formations.controller.ts
import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, UseInterceptors, UploadedFile,
  UseGuards, Request, ValidationPipe, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FormationsService } from './formations.service';
import { CreateFormationDto } from './dto/create-formation.dto';
import { UpdateFormationDto } from './dto/update-formation.dto';
import { UpdateStatutDto } from './dto/update-statut.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const imageStorage = diskStorage({
  destination: './uploads/formations',
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `formation-${unique}${extname(file.originalname)}`);
  },
});

@Controller('formations')
export class FormationsController {
  constructor(private readonly formationsService: FormationsService) {}

  @Post('expert/proposer')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  async proposerParExpert(
    @Body(ValidationPipe) dto: CreateFormationDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    const expertId = req.user.id;
    return this.formationsService.createFromExpert(dto, file, expertId);
  }

  @Get('expert/mes-formations')
  @UseGuards(JwtAuthGuard)
  async getMesFormations(@Request() req: any) {
    return this.formationsService.findByExpert(req.user.id);
  }

  @Post('admin/create')
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  async create(@Body(ValidationPipe) dto: CreateFormationDto, @UploadedFile() file: Express.Multer.File) {
    return this.formationsService.create(dto, file);
  }

  @Get('admin/all')
  async findAll() {
    return this.formationsService.findAll();
  }

  @Put('admin/:id')
  @UseInterceptors(FileInterceptor('image', { storage: imageStorage }))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateFormationDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.formationsService.update(id, dto, file);
  }

  @Patch('admin/:id/statut')
  async updateStatut(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) dto: UpdateStatutDto,
  ) {
    return this.formationsService.updateStatut(id, dto);
  }

  @Delete('admin/:id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.formationsService.delete(id);
  }

  @Get('public')
  async findPublished() {
    return this.formationsService.findPublished();
  }

  @Get('public/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formationsService.findOne(id);
  }
}