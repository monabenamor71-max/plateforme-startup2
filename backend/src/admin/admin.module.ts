import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { User } from '../users/user.entity';
import { Expert } from '../experts/expert.entity';
import { Startup } from '../startups/startup.entity';
import { Temoignage } from '../temoignages/temoignage.entity'; // ← import
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Expert, Startup, Temoignage]), // ← ajout
    AuthModule,
  ],
  providers: [AdminService],
  controllers: [AdminController],
})
export class AdminModule {}