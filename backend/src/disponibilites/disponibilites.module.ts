import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisponibilitesService } from './disponibilites.service';
import { DisponibilitesController } from './disponibilites.controller';
import { Disponibilite } from './disponibilite.entity';
import { ExpertsModule } from '../experts/experts.module';

@Module({
  imports: [TypeOrmModule.forFeature([Disponibilite]), ExpertsModule],
  providers: [DisponibilitesService],
  controllers: [DisponibilitesController],
  exports: [DisponibilitesService],
})
export class DisponibilitesModule {}