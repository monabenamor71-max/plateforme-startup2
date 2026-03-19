import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemoignagesService } from './temoignages.service';
import { TemoignagesController } from './temoignages.controller';
import { Temoignage } from './temoignage.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Temoignage]), UsersModule],
  providers: [TemoignagesService],
  controllers: [TemoignagesController],
  exports: [TemoignagesService],
})
export class TemoignagesModule {}