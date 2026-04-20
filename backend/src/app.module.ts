// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { AdminModule } from './admin/admin.module';
import { ExpertsModule } from './experts/experts.module';
import { StartupsModule } from './startups/startups.module';
import { RendezVousModule } from './rendez-vous/rendez-vous.module';
import { MessagesModule } from './messages/messages.module';
import { TemoignagesModule } from './temoignages/temoignages.module';
import { DevisModule } from './devis/devis.module';
import { HistoireModule } from './histoire/histoire.module';
import { DemandesServiceModule } from './demandes-service/demandes-service.module';
import { ServicesPlateformeModule } from './services-plateforme/services-plateforme.module';
import { FormationsModule } from './formations/formations.module';
import { ContactModule } from './contact/contact.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { CommentsModule } from './comments/comments.module';
import { BlogModule } from './blog/blog.module';          // Blog
import { MediaModule } from './media/media.module';  

import { User } from './user/user.entity';
import { Expert } from './user/expert.entity';
import { Startup } from './user/startup.entity';
import { Comment } from './comments/comment.entity';
import { Rendezvous } from './rendez-vous/rendezvous.entity';
import { Message } from './messages/message.entity';
import { Temoignage } from './temoignages/temoignage.entity';
import { Histoire } from './histoire/histoire.entity';
import { DemandeService } from './demandes-service/demande-service.entity';
import { ServicePlateforme } from './services-plateforme/service-plateforme.entity';
import { ContactMessage } from './contact/contact-message.entity';
import { ContactConfig } from './contact/contact-config.entity';
import { Newsletter } from './newsletter/newsletter.entity';
import { Formation } from './formations/formation.entity';
import { Devis } from './devis/devis.entity';
import { Blog } from './blog/blog.entity';
import { Media } from './media/media.entity';
        

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'consulting_platform',
      entities: [
        User, Expert, Startup, Rendezvous,
        Message, Temoignage, Histoire, DemandeService,
        ServicePlateforme, ContactMessage, ContactConfig, Newsletter, Comment,
        Formation, Devis,
        Blog,
        Media,                                            
      ],
      synchronize: true,
      logging: true,
    }),
    UserModule,
    AuthModule,
    MailModule,
    AdminModule,
    ExpertsModule,
    StartupsModule,
    RendezVousModule,
    MessagesModule,
    TemoignagesModule,
    HistoireModule,
    DemandesServiceModule,
    ServicesPlateformeModule,
    ContactModule,
    CommentsModule,
    NewsletterModule,
    FormationsModule,
    DevisModule,
    BlogModule,
    MediaModule,                                          // ← AJOUT
  ],
})
export class AppModule {}