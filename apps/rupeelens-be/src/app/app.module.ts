import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";

import { AccountsModule } from "../accounts/accounts.module";
import { AuthModule } from "../auth/auth.module";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { IngestionCoreModule } from "../core/ingestion/ingestion-core.module";
import { HealthModule } from "../health/health.module";
import { CsvImportModule } from "../imports/csv/csv-import.module";
import { EmailImportModule } from "../imports/email/email-import.module";
import { SmsImportModule } from "../imports/sms/sms-import.module";
import { SetuIntegrationModule } from "../integrations/setu/setu-integration.module";
import { PrismaModule } from "../prisma/prisma.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { isSetuEnabled } from "./app.config";

const setuModules = isSetuEnabled() ? [SetuIntegrationModule] : [];

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env"],
      isGlobal: true,
    }),
    PrismaModule,
    IngestionCoreModule,
    AuthModule,
    HealthModule,
    AccountsModule,
    CsvImportModule,
    EmailImportModule,
    SmsImportModule,
    TransactionsModule,
    ...setuModules,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
