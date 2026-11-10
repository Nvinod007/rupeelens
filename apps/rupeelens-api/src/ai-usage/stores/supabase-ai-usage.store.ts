import { Injectable } from '@nestjs/common';

import { SupabaseService } from '../../database/supabase.service';
import { AiUsageStore } from '../ai-usage.store';

const TABLE = 'ai_usage';
const CONSUME_FN = 'consume_ai_quota';
const LIMIT_REACHED = -1;

@Injectable()
export class SupabaseAiUsageStore extends AiUsageStore {
  constructor(private readonly supabase: SupabaseService) {
    super();
  }

  async consume(ownerId: string, day: string, limit: number): Promise<number | null> {
    const { data, error } = await this.client().rpc(CONSUME_FN, {
      p_day: day,
      p_limit: limit,
      p_user: ownerId,
    });
    if (error) {
      throw new Error(error.message);
    }
    const used = Number(data);
    return used === LIMIT_REACHED ? null : used;
  }

  async get(ownerId: string, day: string): Promise<number> {
    const { data, error } = await this.client()
      .from(TABLE)
      .select('count')
      .eq('user_id', ownerId)
      .eq('day', day)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return Number(data?.count ?? 0);
  }

  private client() {
    const client = this.supabase.getClient();
    if (!client) {
      throw new Error('Supabase is not configured');
    }
    return client;
  }
}
