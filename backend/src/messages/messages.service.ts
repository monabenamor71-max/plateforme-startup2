import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async send(sender_id: number, receiver_id: number, contenu: string) {
    const msg = this.messageRepo.create({ sender_id, receiver_id, contenu });
    return this.messageRepo.save(msg);
  }

  async getMyMessages(userId: number) {
    return this.messageRepo.find({
      where: [{ sender_id: userId }, { receiver_id: userId }],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  }

  async getExpertMessages(userId: number) {
    return this.messageRepo.find({
      where: [{ sender_id: userId }, { receiver_id: userId }],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  }

  async getConversation(user1_id: number, user2_id: number) {
    return this.messageRepo.find({
      where: [
        { sender_id: user1_id, receiver_id: user2_id },
        { sender_id: user2_id, receiver_id: user1_id },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(userId: number, senderId: number) {
    await this.messageRepo.update(
      { receiver_id: userId, sender_id: senderId },
      { lu: true },
    );
    return { message: 'Lu' };
  }

  async getUnread(userId: number) {
    const msgs = await this.messageRepo.find({
      where: { receiver_id: userId, lu: false },
    });
    return { count: msgs.length };
  }

  // ✅ AJOUT : Supprimer un message (vérification des droits)
  async deleteMessage(id: number, userId: number, isAdmin: boolean) {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) {
      throw new NotFoundException('Message non trouvé');
    }
    // Seul l'expéditeur ou un admin peut supprimer
    if (!isAdmin && message.sender_id !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres messages');
    }
    await this.messageRepo.delete(id);
    return { success: true };
  }
}