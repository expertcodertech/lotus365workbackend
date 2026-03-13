import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('v1');

  // CORS - Allow your server IP with all necessary ports
  app.enableCors({
    origin: [
      'http://localhost:3001', 
      'http://localhost:3002',
      'http://localhost:3003',
      'https://admin.lotus365.app',
      'http://91.184.244.196:3001',
      'http://91.184.244.196:3002',
      'http://91.184.244.196:3003',
      'http://91.184.244.196',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002',
      'http://127.0.0.1:3003'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🪷 Lotus365 Earn API running on port ${port}`);
}
bootstrap();
