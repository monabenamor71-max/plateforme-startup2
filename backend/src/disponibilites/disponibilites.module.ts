import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DisponibilitesService } from "./disponibilites.service";
import { DisponibilitesController } from "./disponibilites.controller";
import { Disponibilite } from "./disponibilite.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Disponibilite])],
  controllers: [DisponibilitesController],
  providers: [DisponibilitesService],
})
export class DisponibilitesModule {}