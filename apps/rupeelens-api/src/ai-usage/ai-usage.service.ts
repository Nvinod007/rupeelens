import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { AiUsage } from '@shared-types';
import { ymdInZone } from '@shared-utils';

import { aiQuotaConfig } from '../config/configuration';
import { AiUsageStore } from './ai-usage.store';

@Injectable()
export class AiUsageService {
  private readonly logger = new Logger(AiUsageService.name);

  constructor(
    private readonly store: AiUsageStore,
    @Inject(aiQuotaConfig.KEY)
    private readonly config: ConfigType<typeof aiQuotaConfig>
  ) {}

  get dailyLimit(): number {
    return this.config.dailyLimit;
  }

  /**
   * Reserves one AI use for today (IST). Returns `false` when the daily limit is reached.
   * If the usage store fails, the request is allowed: quota must not take the product down.
   */
  async tryConsume(ownerId: string): Promise<boolean> {
    try {
      const used = await this.store.consume(
        ownerId,
        ymdInZone(new Date()),
        this.config.dailyLimit
      );
      return used !== null;
    } catch (error) {
      this.logger.warn(`AI quota check skipped: ${(error as Error).message}`);
      return true;
    }
  }

  async usage(ownerId: string): Promise<AiUsage> {
    try {
      const used = await this.store.get(ownerId, ymdInZone(new Date()));
      return { limit: this.config.dailyLimit, used };
    } catch (error) {
      this.logger.warn(`AI usage read failed: ${(error as Error).message}`);
      return { limit: this.config.dailyLimit, used: 0 };
    }
  }
}
