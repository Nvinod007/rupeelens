import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AuthGuard } from '../auth/auth.guard';
import { AuthModule } from '../auth/auth.module';
import { AppThrottlerGuard } from '../common/throttle/app-throttler.guard';
import { RATE_LIMITS } from '../config/config.constants';
import { configLoaders } from '../config/configuration';
import { validateEnv } from '../config/env.validation';
import { CategoriesModule } from '../categories/categories.module';
import { CryptoModule } from '../crypto/crypto.module';
import { DatabaseModule } from '../database/database.module';
import { HealthModule } from '../health/health.module';
import { ParseModule } from '../parse/parse.module';
import { SettingsModule } from '../settings/settings.module';
import { TransactionsModule } from '../transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      // `.env` is loaded (and wins over the shell) by `config/load-env`.
      ignoreEnvFile: true,
      isGlobal: true,
      load: configLoaders,
      validate: validateEnv,
    }),
    ThrottlerModule.forRoot([RATE_LIMITS.default]),
    CryptoModule,
    DatabaseModule,
    AuthModule,
    HealthModule,
    SettingsModule,
    TransactionsModule,
    CategoriesModule,
    ParseModule,
  ],
  // Order matters: authenticate first so the throttler can key on the user id.
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
  ],
})
export class AppModule {}
