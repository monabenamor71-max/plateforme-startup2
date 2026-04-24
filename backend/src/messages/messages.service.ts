// src/messages/messages.service.ts
import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { SendMessageDto } from './dto/message.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
  ) {}

  async send(sender_id: number, dto: SendMessageDto) {
    const { receiver_id, contenu } = dto;
    if (sender_id === receiver_id) {
      throw new ForbiddenException("Vous ne pouvez pas vous envoyer un message à vous-même");
    }
    const msg = this.messageRepo.create({ sender_id, receiver_id, contenu });
    const saved = await this.messageRepo.save(msg);
    if (!saved || !saved.id) {
      throw new BadRequestException('Erreur lors de l’envoi du message');
    }
    this.logger.log(`Message envoyé de ${sender_id} à ${receiver_id}`);
    return saved;
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
    if (!user1_id || !user2_id) throw new NotFoundException('Utilisateurs invalides');
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
    const result = await this.messageRepo.update(
      { receiver_id: userId, sender_id: senderId, lu: false },
      { lu: true },
    );
    if (result.affected === 0) {
      this.logger.warn(`Aucun message non lu de ${senderId} pour ${userId}`);
    } else {
      this.logger.log(`${result.affected} message(s) marqués lus`);
    }
    return { message: 'Messages marqués comme lus' };
  }

  async getUnread(userId: number) {
    const count = await this.messageRepo.count({
      where: { receiver_id: userId, lu: false },
    });
    return { count };
  }

  async deleteMessage(id: number, userId: number, isAdmin: boolean) {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Message non trouvé');
    if (!isAdmin && message.sender_id !== userId) {
      throw new ForbiddenException('Vous ne pouvez supprimer que vos propres messages');
    }
    const deleteResult = await this.messageRepo.delete(id);
    if (deleteResult.affected === 0) {
      throw new BadRequestException('Impossible de supprimer le message');
    }
    this.logger.log(`Message ${id} supprimé par ${isAdmin ? 'admin' : `utilisateur ${userId}`}`);
    return { success: true };
  }
}