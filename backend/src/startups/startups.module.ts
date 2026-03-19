import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StartupsService } from './startups.service';
import { StartupsController } from './startups.controller';
import { Startup } from './startup.entity';
import { Temoignage } from '../temoignages/temoignage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Startup, Temoignage])],
  controllers: [StartupsController],
  providers: [StartupsService],
  exports: [StartupsService],
})
export class StartupsModule {}