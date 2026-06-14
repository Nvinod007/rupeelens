import { Module } from "@nestjs/common";

import { SetuModule } from "../client/setu.module";
import { SetuIngestionModule } from "../setu-ingestion.module";
import { WebhookController } from "./webhook.controller";
import { WebhookService } from "./webhook.service";
import { WebhookHmacGuard } from "./webhook-hmac.guard";

@Module({
  controllers: [WebhookController],
  imports: [SetuModule, SetuIngestionModule],
  providers: [WebhookService, WebhookHmacGuard],
})
export class WebhookModule {}
