import { Controller, Get, Post, Body, Param, Put, UseGuards, Req } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  envoyer(@Req() req: any, @Body() body: { receiver_id: number; contenu: string }) {
    return this.messagesService.envoyer(req.user.id, body.receiver_id, body.contenu);
  }

  @Get()
  getMesMessages(@Req() req: any) {
    return this.messagesService.getMesMessages(req.user.id);
  }

  @Get('expert')
  getMessagesExpert(@Req() req: any) {
    return this.messagesService.getMessagesExpert(req.user.id);
  }

  @Get('conversation/:userId')
  getConversation(@Req() req: any, @Param('userId') userId: string) {
    return this.messagesService.getConversation(req.user.id, +userId);
  }

  @Put(':id/lu')
  marquerLu(@Param('id') id: string) {
    return this.messagesService.marquerLu(+id);
  }
}