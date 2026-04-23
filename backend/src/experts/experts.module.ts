// src/experts/experts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { ExpertsService } from './experts.service';
import { ExpertsController } from './experts.controller';
import { Expert } from '../user/expert.entity';
import { User } from '../user/user.entity';
import { MailModule } from '../mail/mail.module';
import * as path from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expert, User]),
    MulterModule.register({
      dest: path.join(process.cwd(), 'uploads', 'photos'),
    }),
    MailModule,
  ],
  controllers: [ExpertsController],
  providers: [ExpertsService],
  exports: [ExpertsService],
})
export class ExpertsModule {}