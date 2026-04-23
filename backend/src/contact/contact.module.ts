// src/contact/contact.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { ContactConfig } from './contact-config.entity';
import { ContactMessage } from './contact-message.entity';
import { MailService } from '../mail/mail.service'; // chemin à adapter

@Module({
  imports: [TypeOrmModule.forFeature([ContactConfig, ContactMessage])],
  controllers: [ContactController],
  providers: [ContactService, MailService],
  exports: [ContactService],
})
export class ContactModule {}