import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import type { Request } from "express";

const DEFAULT_LIMIT = 60;
const WINDOW_MS = 60_000;

@Injectable()
export class SmsWebhookRateLimitGuard implements CanActivate {
  private readonly hits = new Map<string, number[]>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key =
      (request.headers["x-import-key"] as string | undefined)?.trim() ||
      request.ip ||
      "unknown";

    const limit = Number.parseInt(
      process.env.SMS_WEBHOOK_RATE_LIMIT_PER_MINUTE ?? "",
      10
    );
    const maxHits = Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_LIMIT;

    const now = Date.now();
    const windowStart = now - WINDOW_MS;
    const timestamps = (this.hits.get(key) ?? []).filter(
      (t) => t > windowStart
    );

    if (timestamps.length >= maxHits) {
      throw new HttpException(
        "Too many SMS webhook requests — try again later",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);
    return true;
  }
}
