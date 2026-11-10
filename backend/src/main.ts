import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './app.config.js';

async function bootstrap() {
  // The body parser is configured in `configureApp`.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });
  configureApp(app);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
