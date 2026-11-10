import { Injectable } from '@nestjs/common';

import { AiUsageStore } from '../ai-usage.store';

/** Used when Supabase is not configured (local dev); resets on restart. */
@Injectable()
export class InMemoryAiUsageStore extends AiUsageStore {
  private readonly counts = new Map<string, number>();

  async consume(ownerId: string, day: string, limit: number): Promise<number | null> {
    const key = `${ownerId}:${day}`;
    const used = this.counts.get(key) ?? 0;
    if (used >= limit) {
      return null;
    }
    this.counts.set(key, used + 1);
    return used + 1;
  }

  async get(ownerId: string, day: string): Promise<number> {
    return this.counts.get(`${ownerId}:${day}`) ?? 0;
  }
}
