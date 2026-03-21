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
import { MessagesModule } from './messages/messages.module';
import { RendezvousModule } from './rendezvous/rendezvous.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'consulting_platform',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    UsersModule,
    ExpertsModule,
    StartupsModule,
    AuthModule,
    AdminModule,
    DisponibilitesModule,
    TemoignagesModule,
    MessagesModule,
    RendezvousModule,
  ],
})
export class AppModule {}