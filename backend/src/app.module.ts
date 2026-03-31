import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AdminModule } from './admin/admin.module';
import { ExpertsModule } from './experts/experts.module';
import { StartupsModule } from './startups/startups.module';
import { RendezVousModule } from './rendez-vous/rendez-vous.module';
import { DisponibilitesModule } from './disponibilites/disponibilites.module';
import { MessagesModule } from './messages/messages.module';
import { TemoignagesModule } from './temoignages/temoignages.module';
import { User } from './user/user.entity';
import { Expert } from './user/expert.entity';
import { Startup } from './user/startup.entity';
import { Rendezvous } from './rendez-vous/rendezvous.entity';
import { Disponibilite } from './disponibilites/disponibilite.entity';
import { Message } from './messages/message.entity';
import { Temoignage } from './temoignages/temoignage.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'consulting_platform',
      entities: [User, Expert, Startup, Rendezvous, Disponibilite, Message, Temoignage],
      synchronize: true,
      logging: false,
    }),
    UserModule,
    AuthModule,
    MailModule,
    AdminModule,
    ExpertsModule,
    StartupsModule,
    RendezVousModule,
    DisponibilitesModule,
    MessagesModule,
    TemoignagesModule,
  ],
})
export class AppModule {}