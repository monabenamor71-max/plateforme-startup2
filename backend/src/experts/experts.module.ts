import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expert } from './expert.entity';
import { ExpertsService } from './experts.service';
import { ExpertsController } from './experts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Expert])],
  providers: [ExpertsService],
  controllers: [ExpertsController],
  exports: [TypeOrmModule],
})
export class ExpertsModule {}