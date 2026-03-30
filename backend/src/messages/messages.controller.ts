import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  send(@Body() body: any, @Request() req: any) {
    return this.messagesService.send(req.user.id, body.receiver_id, body.contenu);
  }

  @Get('mes-messages')
  @UseGuards(JwtAuthGuard)
  getMyMessages(@Request() req: any) {
    return this.messagesService.getMyMessages(req.user.id);
  }

  @Get('expert')
  @UseGuards(JwtAuthGuard)
  getExpertMessages(@Request() req: any) {
    return this.messagesService.getExpertMessages(req.user.id);
  }

  @Get('conversation/:userId')
  @UseGuards(JwtAuthGuard)
  getConversation(@Request() req: any, @Param('userId') userId: number) {
    return this.messagesService.getConversation(req.user.id, Number(userId));
  }

  @Get('non-lus')
  @UseGuards(JwtAuthGuard)
  getUnread(@Request() req: any) {
    return this.messagesService.getUnread(req.user.id);
  }

  @Post('lire/:senderId')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Request() req: any, @Param('senderId') senderId: number) {
    return this.messagesService.markAsRead(req.user.id, Number(senderId));
  }
}