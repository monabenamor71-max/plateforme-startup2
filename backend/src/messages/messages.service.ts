import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async envoyer(senderId: number, receiverId: number, contenu: string) {
    const msg = this.messageRepo.create({
      sender_id: senderId,
      receiver_id: receiverId,
      contenu,
      lu: false,
    } as any);
    return this.messageRepo.save(msg as any);
  }

  async getMesMessages(userId: number) {
    return this.messageRepo.find({
      where: [
        { sender_id: userId } as any,
        { receiver_id: userId } as any,
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }

  async getConversation(userId1: number, userId2: number) {
    const msgs = await this.messageRepo.find({
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });
    return msgs.filter(m =>
      (m.sender_id === userId1 && m.receiver_id === userId2) ||
      (m.sender_id === userId2 && m.receiver_id === userId1)
    );
  }

  async marquerLu(messageId: number) {
    await this.messageRepo.update(messageId, { lu: true });
    return { success: true };
  }

  async getMessagesExpert(expertUserId: number) {
    return this.messageRepo.find({
      where: [
        { sender_id: expertUserId } as any,
        { receiver_id: expertUserId } as any,
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });
  }
}