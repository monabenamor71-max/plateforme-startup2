import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandesServiceService } from './demandes-service.service';
import { DemandesServiceController } from './demandes-service.controller';
import { DemandeService } from './demande-service.entity';
import { Formation } from '../formations/formation.entity';
import { Expert } from '../user/expert.entity';
import { FormationsModule } from '../formations/formations.module'; // Ajout

@Module({
  imports: [
    TypeOrmModule.forFeature([DemandeService, Formation, Expert]),
    FormationsModule, // Import du module qui exporte FormationsService
  ],
  controllers: [DemandesServiceController],
  providers: [DemandesServiceService],
  exports: [DemandesServiceService],
})
export class DemandesServiceModule {}