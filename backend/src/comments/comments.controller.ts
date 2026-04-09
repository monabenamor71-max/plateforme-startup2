import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private svc: CommentsService) {}

  @Post('create')
  async create(@Body() body: any) {
    return this.svc.create({
      comment: body.comment,
      nom: body.nom,
      email: body.email,
      site: body.site || '',
      articleId: body.articleId,
    });
  }

  @Get('article/:articleId')
  getByArticle(@Param('articleId') articleId: string) {
    return this.svc.getByArticle(+articleId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  getAll() {
    return this.svc.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/en-attente')
  getEnAttente() {
    return this.svc.getEnAttente();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/approuver')
  approuver(@Param('id') id: string) {
    return this.svc.approuver(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/:id/refuser')
  refuser(@Param('id') id: string) {
    return this.svc.refuser(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:id')
  supprimer(@Param('id') id: string) {
    return this.svc.supprimer(+id);
  }
}