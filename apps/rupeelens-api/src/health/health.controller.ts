import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { Public } from '../auth/public.decorator';

export type HealthResponse = {
  status: 'ok';
  uptimeSeconds: number;
  timestamp: string;
};

/** Liveness probe for Fly.io / load balancers. Intentionally dependency-free. */
@Public()
@SkipThrottle()
@Controller('health')
export class HealthController {
  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    };
  }
}
