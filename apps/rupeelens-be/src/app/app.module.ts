import { Module } from "@nestjs/common";

import { HealthModule } from "../health/health.module";
import { PrismaModule } from "../prisma/prisma.module";
import { TransactionsModule } from "../transactions/transactions.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  controllers: [AppController],
  imports: [PrismaModule, HealthModule, TransactionsModule],
  providers: [AppService],
})
export class AppModule {}
