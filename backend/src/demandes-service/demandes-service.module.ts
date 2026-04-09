import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandesServiceService } from './demandes-service.service';
import { DemandesServiceController } from './demandes-service.controller';
import { DemandeService } from './demande-service.entity';
import { Formation } from '../formations/formation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DemandeService, Formation])],
  controllers: [DemandesServiceController],
  providers: [DemandesServiceService],
  exports: [DemandesServiceService],
})
export class DemandesServiceModule {}