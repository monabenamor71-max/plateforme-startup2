import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';
import { mkdirSync, existsSync } from 'fs';

async function bootstrap() {
  // ========== CRÉATION AUTOMATIQUE DES DOSSIERS ==========
  const uploadDirs = [
    './uploads',
    './uploads/articles-img',
    './uploads/articles-pdf',
    './uploads/videos-miniatures',
    './uploads/podcasts-audio',    // ← ajout
    './uploads/podcasts-images',   // ← ajout
  ];
  uploadDirs.forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
      console.log(`✅ Dossier créé : ${dir}`);
    }
  });
  // ======================================================

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  await app.listen(3001);
  console.log('Backend running on http://localhost:3001');
  console.log('Uploads folder:', path.join(process.cwd(), 'uploads'));
}
bootstrap();