import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NextFunction, Request, Response } from "express";

import { AppModule } from "./app/app.module";

const port = process.env.PORT || 3001;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
const logger = new Logger("HTTP");

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on("finish", () => {
      logger.log(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${Date.now() - start}ms`
      );
    });
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    })
  );

  app.enableCors({
    allowedHeaders: ["Authorization", "Content-Type", "x-import-key"],
    credentials: true,
    origin: frontendUrl,
  });

  const globalPrefix = "api";
  app.setGlobalPrefix(globalPrefix);

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(`CORS origin: ${frontendUrl}`);
  Logger.log(
    `Supabase: ${process.env.SUPABASE_URL ? "URL set" : "URL missing"}, ${
      process.env.SUPABASE_ANON_KEY ? "anon key set" : "anon key missing"
    }`
  );
}

bootstrap();
