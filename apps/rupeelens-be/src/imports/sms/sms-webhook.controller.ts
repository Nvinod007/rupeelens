import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import type { SmsImportResponseDto } from "@shared-types";

import { Public } from "../../auth/public.decorator";
import { SmsImportBodyDto } from "../dto/import.dto";
import { SmsImportService } from "./sms-import.service";
import { SmsWebhookRateLimitGuard } from "./sms-webhook-rate-limit.guard";

@Controller("webhooks/sms")
export class SmsWebhookController {
  constructor(private readonly smsImport: SmsImportService) {}

  @Public()
  @UseGuards(SmsWebhookRateLimitGuard)
  @Post()
  handleSmsWebhook(
    @Headers("x-import-key") importKey: string | undefined,
    @Body() body: SmsImportBodyDto
  ): Promise<SmsImportResponseDto> {
    if (!importKey?.trim()) {
      throw new UnauthorizedException("Missing x-import-key header");
    }
    return this.smsImport.importByWebhookKey(importKey.trim(), body);
  }
}
