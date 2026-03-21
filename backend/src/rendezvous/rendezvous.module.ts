import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RendezvousService } from './rendezvous.service';
import { RendezvousController } from './rendezvous.controller';
import { Rendezvous } from './rendezvous.entity';
import { ExpertsModule } from '../experts/experts.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rendezvous]),
    ExpertsModule,
  ],
  controllers: [RendezvousController],
  providers: [RendezvousService],
  exports: [RendezvousService],
})
export class RendezvousModule {}