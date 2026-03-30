import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RendezVousService } from "./rendez-vous.service";
import { RendezVousController } from "./rendez-vous.controller";
import { Rendezvous } from "./rendezvous.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Rendezvous])],
  controllers: [RendezVousController],
  providers: [RendezVousService],
})
export class RendezVousModule {}