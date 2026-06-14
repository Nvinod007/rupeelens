import { Module } from "@nestjs/common";

import { SetuModule } from "./client/setu.module";
import { ConsentModule } from "./consent/consent.module";
import { SetuIngestionModule } from "./setu-ingestion.module";
import { WebhookModule } from "./webhook/webhook.module";

/** Optional AA (Setu) integration — load only when ENABLE_SETU=true. */
@Module({
  exports: [SetuIngestionModule],
  imports: [SetuModule, ConsentModule, WebhookModule, SetuIngestionModule],
})
export class SetuIntegrationModule {}
