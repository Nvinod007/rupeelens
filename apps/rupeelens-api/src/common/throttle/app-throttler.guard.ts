import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import type { AuthenticatedRequest } from '../../auth/auth.types';

/** Rate limits per authenticated user; unauthenticated traffic falls back to IP. */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected override getTracker(req: Record<string, unknown>): Promise<string> {
    const { user, ip } = req as unknown as AuthenticatedRequest;
    return Promise.resolve(user?.id ?? ip ?? 'unknown');
  }
}
