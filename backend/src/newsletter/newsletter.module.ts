import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { Newsletter } from './newsletter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Newsletter])],
  controllers: [NewsletterController],
  providers: [NewsletterService],
  exports: [NewsletterService],
})
export class NewsletterModule {}
