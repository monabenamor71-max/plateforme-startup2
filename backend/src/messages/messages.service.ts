import { Injectable, NotFoundException, ForbiddenException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { SendMessageDto } from './dto/send-message.dto';

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
    this.logger.log(`✅ Message envoyé de ${sender_id} à ${receiver_id} (id=${saved.id})`);
    return saved;
  }

  async getMyMessages(userId: number) {
    const messages = await this.messageRepo.find({
      where: [{ sender_id: userId }, { receiver_id: userId }],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });
    this.logger.log(`📦 getMyMessages: ${messages.length} messages pour l'utilisateur ${userId}`);
    return messages;
  }

  async getConversation(user1_id: number, user2_id: number) {
    this.logger.log(`🔍 getConversation: user1=${user1_id}, user2=${user2_id}`);
    if (!user1_id || !user2_id) {
      throw new NotFoundException('IDs utilisateurs invalides');
    }
    const messages = await this.messageRepo.find({
      where: [
        { sender_id: user1_id, receiver_id: user2_id },
        { sender_id: user2_id, receiver_id: user1_id },
      ],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'ASC' },
    });
    this.logger.log(`📦 ${messages.length} message(s) trouvé(s) entre ${user1_id} et ${user2_id}`);
    return messages;
  }

  async markAsRead(userId: number, senderId: number) {
    const result = await this.messageRepo.update(
      { receiver_id: userId, sender_id: senderId, lu: false },
      { lu: true },
    );
    this.logger.log(`${result.affected} message(s) marqués lus de ${senderId} vers ${userId}`);
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
    await this.messageRepo.delete(id);
    this.logger.log(`Message ${id} supprimé par ${isAdmin ? 'admin' : `utilisateur ${userId}`}`);
    return { success: true };
  }
}