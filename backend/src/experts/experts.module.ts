import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertsService } from './experts.service';
import { ExpertsController } from './experts.controller';
import { Expert } from './expert.entity';
import { Temoignage } from '../temoignages/temoignage.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expert, Temoignage])],
  controllers: [ExpertsController],
  providers: [ExpertsService],
  exports: [ExpertsService],
})
export class ExpertsModule {}