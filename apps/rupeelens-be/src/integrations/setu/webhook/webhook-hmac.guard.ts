import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { createHmac, timingSafeEqual } from "crypto";
import type { Request } from "express";

import { SetuService } from "../client/setu.service";

const SIGNATURE_HEADER = "x-setu-signature";

type RawBodyRequest = Request & { rawBody?: Buffer };

@Injectable()
export class WebhookHmacGuard implements CanActivate {
  constructor(private readonly setu: SetuService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RawBodyRequest>();
    const config = this.setu.getConfig();
    const signature = req.headers[SIGNATURE_HEADER];

    if (!config.webhookSecret) {
      if (config.isMockMode) {
        return true;
      }
      throw new UnauthorizedException("Webhook secret not configured");
    }

    if (typeof signature !== "string" || !signature) {
      throw new UnauthorizedException("Missing x-setu-signature header");
    }

    const payload =
      req.rawBody?.toString("utf8") ?? JSON.stringify(req.body ?? {});

    if (!this.verifySignature(payload, config.webhookSecret, signature)) {
      throw new UnauthorizedException("Invalid webhook signature");
    }

    return true;
  }

  private verifySignature(
    payload: string,
    secret: string,
    signature: string
  ): boolean {
    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("base64");

    try {
      return timingSafeEqual(
        Buffer.from(signature, "base64"),
        Buffer.from(expected, "base64")
      );
    } catch {
      return false;
    }
  }
}
