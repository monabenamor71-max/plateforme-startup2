// src/demandes-service/demandes-service.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandesServiceService } from './demandes-service.service';
import { DemandesServiceController } from './demandes-service.controller';
import { DemandeService } from './demande-service.entity';
import { Formation } from '../formations/formation.entity';
import { Expert } from '../user/expert.entity';
import { Devis } from '../devis/devis.entity';      // ✅ IMPORT AJOUTÉ
import { FormationsModule } from '../formations/formations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DemandeService, Formation, Expert, Devis]), // ✅ Devis AJOUTÉ
    FormationsModule,
  ],
  controllers: [DemandesServiceController],
  providers: [DemandesServiceService],
  exports: [DemandesServiceService],
})
export class DemandesServiceModule {}