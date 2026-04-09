import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DemandesServiceService } from './demandes-service.service';
import { DemandesServiceController } from './demandes-service.controller';
import { DemandeService } from './demande-service.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DemandeService])],
  controllers: [DemandesServiceController],
  providers: [DemandesServiceService],
  exports: [DemandesServiceService],
})
export class DemandesServiceModule {}