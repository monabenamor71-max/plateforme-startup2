import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMessageDto } from './dto/message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  send(@Body(ValidationPipe) dto: SendMessageDto, @Request() req: any) {
    return this.messagesService.send(req.user.id, dto);
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
  getConversation(@Request() req: any, @Param('userId', ParseIntPipe) userId: number) {
    return this.messagesService.getConversation(req.user.id, userId);
  }

  @Get('non-lus')
  @UseGuards(JwtAuthGuard)
  getUnread(@Request() req: any) {
    return this.messagesService.getUnread(req.user.id);
  }

  @Post('lire/:senderId')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Request() req: any, @Param('senderId', ParseIntPipe) senderId: number) {
    return this.messagesService.markAsRead(req.user.id, senderId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteMessage(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'admin';
    return this.messagesService.deleteMessage(id, userId, isAdmin);
  }
}