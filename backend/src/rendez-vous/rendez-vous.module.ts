import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RendezVousService } from './rendez-vous.service';
import { RendezVousController } from './rendez-vous.controller';
import { Rendezvous } from './rendezvous.entity';
import { Expert } from '../user/expert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rendezvous, Expert])],
  controllers: [RendezVousController],
  providers: [RendezVousService],
})
export class RendezVousModule {}