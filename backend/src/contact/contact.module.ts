import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { ContactMessage } from './contact-message.entity';
import { ContactConfig } from './contact-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContactMessage, ContactConfig])],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
