import { Module } from "@nestjs/common";

import { SmsImportController } from "./sms-import.controller";
import { SmsImportService } from "./sms-import.service";
import { SmsWebhookController } from "./sms-webhook.controller";
import { SmsWebhookRateLimitGuard } from "./sms-webhook-rate-limit.guard";

@Module({
  controllers: [SmsImportController, SmsWebhookController],
  providers: [SmsImportService, SmsWebhookRateLimitGuard],
})
export class SmsImportModule {}
