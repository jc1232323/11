import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import type { NextFunction, Request, Response } from 'express';
import { existsSync } from 'fs';
import { extname, join, normalize, relative, resolve } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { loadEnvFiles } from './config/load-env';

function contentType(filePath: string) {
  const ext = extname(filePath);
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js') return 'text/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  if (ext === '.json') return 'application/json; charset=utf-8';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.ico') return 'image/x-icon';
  return 'application/octet-stream';
}

function enableStaticWeb(app: Awaited<ReturnType<typeof NestFactory.create>>) {
  const staticRootEnv = process.env.SERVE_STATIC_ROOT;
  if (!staticRootEnv) return;

  const staticRoot = resolve(staticRootEnv);
  const indexFile = join(staticRoot, 'index.html');
  if (!existsSync(indexFile)) {
    console.warn(`[static] index.html not found in ${staticRoot}; web static serving disabled`);
    return;
  }

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.method || !['GET', 'HEAD'].includes(req.method)) return next();
    if (!req.url || req.url.startsWith('/api')) return next();

    const pathname = decodeURIComponent(req.url.split('?')[0] ?? '/');
    const requested = normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    const candidate = resolve(join(staticRoot, requested));
    const relativePath = relative(staticRoot, candidate);
    const filePath =
      relativePath && !relativePath.startsWith('..') && !relativePath.startsWith('/') && existsSync(candidate)
        ? candidate
        : indexFile;

    res.setHeader('Content-Type', contentType(filePath));
    res.sendFile(filePath);
  });
  console.log(`[static] serving web from ${staticRoot}`);
}

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
  enableStaticWeb(app);

  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 3001);
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

bootstrap();
