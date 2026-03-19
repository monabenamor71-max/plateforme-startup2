import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Autoriser les requêtes cross-origin (nécessaire pour le frontend)
  
  // Servir les fichiers statiques du dossier uploads (photos, CV, etc.)
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on http://localhost:${port}`);
}
bootstrap();