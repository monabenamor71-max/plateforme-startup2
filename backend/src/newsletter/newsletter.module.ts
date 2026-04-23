import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';   // ← ajout indispensable
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { Newsletter } from './newsletter.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Newsletter]),
    ConfigModule,   // ← rend ConfigService injectable
  ],
  controllers: [NewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}