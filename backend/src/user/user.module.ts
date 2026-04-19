import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { Expert } from './expert.entity';
import { Startup } from './startup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Expert, Startup])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}