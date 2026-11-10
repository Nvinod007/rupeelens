import { Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

import type { AuthenticatedRequest } from '../../auth/auth.types';

const REQUEST_ID_HEADER = 'x-request-id';
const SLOW_REQUEST_MS = 1_000;
const MAX_INCOMING_ID_LENGTH = 64;

const STRUCTURED = process.env['NODE_ENV'] === 'production';

const logger = new Logger('HttpRequest');

/**
 * Tags every request with an id (echoed in `x-request-id`) and logs one line when it
 * finishes: method, path (no query string, which can hold search text), status, latency, user.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.headers[REQUEST_ID_HEADER];
  const requestId =
    typeof incoming === 'string' && incoming.length <= MAX_INCOMING_ID_LENGTH
      ? incoming
      : randomUUID();
  res.setHeader(REQUEST_ID_HEADER, requestId);

  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const entry = {
      durationMs: Math.round(durationMs),
      message: 'request',
      method: req.method,
      path: req.originalUrl.split('?')[0],
      requestId,
      status: res.statusCode,
      userId: (req as AuthenticatedRequest).user?.id,
    };

    // Health probes hit this constantly; only log them when they fail.
    if (entry.path?.endsWith('/health') && res.statusCode < 400) {
      return;
    }

    // Production: structured fields. Development: one readable line.
    const payload = STRUCTURED
      ? entry
      : `${entry.method} ${entry.path} ${entry.status} ${entry.durationMs}ms`;

    if (res.statusCode >= 500) {
      logger.error(payload);
    } else if (res.statusCode >= 400 || durationMs >= SLOW_REQUEST_MS) {
      logger.warn(payload);
    } else {
      logger.log(payload);
    }
  });

  next();
}
