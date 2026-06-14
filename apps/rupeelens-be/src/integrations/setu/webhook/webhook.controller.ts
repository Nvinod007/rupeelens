import { Body, Controller, Post, Req, UseGuards } from "@nestjs/common";
import type { SetuWebhookPayload, SetuWebhookResponse } from "@shared-types";
import type { Request } from "express";

import { Public } from "../../../auth/public.decorator";
import { SetuService } from "../client/setu.service";
import { WebhookService } from "./webhook.service";
import { WebhookHmacGuard } from "./webhook-hmac.guard";

@Controller("webhooks")
export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly setu: SetuService
  ) {}

  @Public()
  @UseGuards(WebhookHmacGuard)
  @Post("setu")
  handleSetuWebhook(
    @Body() body: SetuWebhookPayload,
    @Req() req: Request
  ): Promise<SetuWebhookResponse> {
    const config = this.setu.getConfig();
    const signatureValid =
      config.isMockMode && !config.webhookSecret
        ? true
        : typeof req.headers["x-setu-signature"] === "string";

    return this.webhookService.handleSetuWebhook(body, signatureValid);
  }
}
