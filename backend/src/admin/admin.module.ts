import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { Expert } from '../experts/expert.entity';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Expert])],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [TypeOrmModule],
})
export class AdminModule {}
