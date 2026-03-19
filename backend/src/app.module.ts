import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ExpertsModule } from './experts/experts.module';
import { StartupsModule } from './startups/startups.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { DisponibilitesModule } from './disponibilites/disponibilites.module';
import { TemoignagesModule } from './temoignages/temoignages.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '123456',
      database: process.env.DB_DATABASE || 'plateforme_startup',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    }),
    UsersModule,
    ExpertsModule,
    StartupsModule,
    AuthModule,
    AdminModule,
    DisponibilitesModule,
    TemoignagesModule,
  ],
})
export class AppModule {}