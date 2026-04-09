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
import { HistoireModule } from './histoire/histoire.module';
import { DemandesServiceModule } from './demandes-service/demandes-service.module';
import { ServicesPlateformeModule } from './services-plateforme/services-plateforme.module';
import { FormationsModule } from './formations/formations.module';
import { ContactModule } from './contact/contact.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { User } from './user/user.entity';
import { Expert } from './user/expert.entity';
import { Startup } from './user/startup.entity';
import { ArticlesModule } from './articles/articles.module';
import { Article } from './articles/article.entity';
import { CommentsModule } from './comments/comments.module';
import { Comment } from './comments/comment.entity';
import { Rendezvous } from './rendez-vous/rendezvous.entity';
import { Disponibilite } from './disponibilites/disponibilite.entity';
import { Message } from './messages/message.entity';
import { Temoignage } from './temoignages/temoignage.entity';
import { Histoire } from './histoire/histoire.entity';
import { DemandeService } from './demandes-service/demande-service.entity';
import { ServicePlateforme } from './services-plateforme/service-plateforme.entity';
import { ContactMessage } from './contact/contact-message.entity';
import { ContactConfig } from './contact/contact-config.entity';
import { Newsletter } from './newsletter/newsletter.entity';
import { Formation } from './formations/formation.entity'; // AJOUTER CETTE LIGNE

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
        User, Expert, Startup, Rendezvous, Disponibilite,
        Message, Temoignage, Histoire, DemandeService,
        ServicePlateforme, ContactMessage, ContactConfig, Newsletter, Article, Comment,
        Formation, // AJOUTER CETTE LIGNE
      ],
      synchronize: true, // ← Mettre à true pour créer automatiquement la table
      logging: true,
    }),
    UserModule, AuthModule, MailModule, AdminModule, ExpertsModule,
    StartupsModule, RendezVousModule, DisponibilitesModule,
    MessagesModule, TemoignagesModule, HistoireModule,
    DemandesServiceModule, ServicesPlateformeModule, ContactModule, ArticlesModule,
    CommentsModule, NewsletterModule, FormationsModule,
  ],
})
export class AppModule {}