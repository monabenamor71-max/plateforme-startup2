import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import * as path from 'path';
import { mkdirSync, existsSync } from 'fs';
import * as express from 'express';

async function bootstrap() {
  // Création des dossiers d'upload
  const uploadDirs = [
    './uploads', './uploads/articles-img', './uploads/articles-pdf',
    './uploads/videos-miniatures', './uploads/podcasts-audio', './uploads/podcasts-images',
    './uploads/photos', './uploads/cv', './uploads/portfolio', './uploads/formations', './logs',
  ];
  uploadDirs.forEach(dir => { if (!existsSync(dir)) mkdirSync(dir, { recursive: true }); });

  // Logger avec Winston
  const logger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({ format: winston.format.simple() }),
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
  });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger });

  // Middlewares
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  app.use(cookieParser());

  // Pipes et filtres globaux
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: process.env.NODE_ENV === 'production', // masque en prod
  }));
  app.useGlobalFilters(new AllExceptionsFilter());  // ← filtre actif partout

  // Dossiers statiques
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  await app.listen(3001);
  console.log('Backend running on http://localhost:3001');
}
bootstrap();