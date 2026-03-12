import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Startup } from './startup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Startup])],
  exports: [TypeOrmModule],
})
export class StartupsModule {}
