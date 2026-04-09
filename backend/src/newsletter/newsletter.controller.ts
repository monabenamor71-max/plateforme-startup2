import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NewsletterService } from './newsletter.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('newsletter')
export class NewsletterController {
  constructor(private svc: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body() body: any) {
    return this.svc.subscribe(body.email, body.nom);
  }

  @Post('unsubscribe')
  unsubscribe(@Body() body: any) {
    return this.svc.unsubscribe(body.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  getAll() { return this.svc.getAll(); }

  @UseGuards(JwtAuthGuard)
  @Post('admin/send')
  send(@Body() body: any) {
    return this.svc.sendNewsletter(body.sujet, body.contenu);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:email')
  remove(@Param('email') email: string) {
    return this.svc.unsubscribe(email);
  }
}
