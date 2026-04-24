import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { NewsletterService, UnsubscribeDto, SendNewsletterDto } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly svc: NewsletterService) {}

  @Post('subscribe')
  subscribe(@Body(ValidationPipe) dto: SubscribeNewsletterDto) {
    return this.svc.subscribe(dto);
  }

  @Post('unsubscribe')
  unsubscribe(@Body(ValidationPipe) dto: UnsubscribeDto) {
    return this.svc.unsubscribe(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/all')
  getAll() {
    return this.svc.getAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/send')
  sendNewsletter(@Body(ValidationPipe) dto: SendNewsletterDto) {
    return this.svc.sendNewsletter(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('admin/:email')
  async remove(@Param('email') email: string) {
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Email invalide');
    }
    return this.svc.removeByEmail(email);
  }
}