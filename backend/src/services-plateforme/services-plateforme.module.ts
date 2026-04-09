import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicePlateforme } from './service-plateforme.entity';

// Crée ce fichier si service + controller n'existent pas encore
// Pour l'instant ce module minimal suffit pour faire compiler l'app

@Module({
  imports: [TypeOrmModule.forFeature([ServicePlateforme])],
})
export class ServicesPlateformeModule {}