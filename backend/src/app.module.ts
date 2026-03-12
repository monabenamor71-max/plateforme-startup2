import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExpertsModule } from './experts/experts.module';
import { StartupsModule } from './startups/startups.module';
import { AdminModule } from './admin/admin.module';
import { User } from './users/user.entity';
import { Expert } from './experts/expert.entity';
import { Startup } from './startups/startup.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '123456',
      database: 'consulting_platform',
      entities: [User, Expert, Startup],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    ExpertsModule,
    StartupsModule,
    AdminModule,
  ],
})
export class AppModule {}
