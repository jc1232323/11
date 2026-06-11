import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { loadEnvFiles } from './config/load-env';

async function bootstrap() {
  const envPath = loadEnvFiles();
  if (envPath) {
    console.log(`[env] 已加载 ${envPath}`);
  } else {
    console.warn('[env] 未找到 .env，请复制 .env.example 到项目根目录');
  }

  const app = await NestFactory.create(AppModule);
  const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173';

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({
    origin: clientUrl,
    credentials: true,
  });
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.API_PORT ?? 3001);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();
