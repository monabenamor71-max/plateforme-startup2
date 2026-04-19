import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Devis } from './devis.entity';
import { DevisService } from './devis.service';
import { DevisController } from './devis.controller';
import { DemandeService } from '../demandes-service/demande-service.entity';
import { Expert } from '../user/expert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Devis, DemandeService, Expert])],
  controllers: [DevisController],
  providers: [DevisService],
  exports: [DevisService],
})
export class DevisModule {}