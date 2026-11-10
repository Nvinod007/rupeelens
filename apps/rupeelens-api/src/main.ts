import './config/load-env';

import { Logger, ValidationPipe } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { API_GLOBAL_PREFIX } from '@shared-types';
import helmet from 'helmet';

import { AppModule } from './app/app.module';
import { JsonLogger } from './common/logging/json-logger';
import { requestLogger } from './common/logging/request-logger.middleware';
import { LOCAL_ORIGIN_PATTERN } from './config/config.constants';
import { appConfig } from './config/configuration';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    // JSON lines in production so the host can index fields; readable text locally.
    logger:
      process.env['NODE_ENV'] === 'production'
        ? new JsonLogger()
        : ['error', 'warn', 'log'],
  });
  const config: ConfigType<typeof appConfig> = app.get(appConfig.KEY);

  app.use(requestLogger);
  app.use(helmet());
  app.setGlobalPrefix(API_GLOBAL_PREFIX);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    })
  );

  app.enableCors({
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    methods: ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    origin: (origin, callback) => {
      const allowed =
        !origin ||
        config.corsOrigins.includes(origin) ||
        (!config.isProduction && LOCAL_ORIGIN_PATTERN.test(origin));
      callback(allowed ? null : new Error(`CORS blocked for origin: ${origin}`), allowed);
    },
  });

  app.enableShutdownHooks();

  await app.listen(config.port);
  Logger.log(
    `API listening on http://localhost:${config.port}/${API_GLOBAL_PREFIX} (${config.nodeEnv})`,
    'Bootstrap'
  );
}

void bootstrap();
