import { Injectable } from '@nestjs/common';

import { SupabaseService } from '../../database/supabase.service';
import { ByokStore } from '../byok.store';

const TABLE = 'user_settings';

@Injectable()
export class SupabaseByokStore extends ByokStore {
  readonly name = 'supabase';

  constructor(private readonly supabase: SupabaseService) {
    super();
  }

  async get(ownerId: string): Promise<string | null> {
    const { data, error } = await this.client()
      .from(TABLE)
      .select('byok_encrypted')
      .eq('user_id', ownerId)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return (data?.byok_encrypted as string | null | undefined) ?? null;
  }

  async set(ownerId: string, encrypted: string): Promise<void> {
    const { error } = await this.client()
      .from(TABLE)
      .upsert({
        byok_encrypted: encrypted,
        updated_at: new Date().toISOString(),
        user_id: ownerId,
      });
    if (error) {
      throw new Error(error.message);
    }
  }

  async delete(ownerId: string): Promise<void> {
    const { error } = await this.client()
      .from(TABLE)
      .update({ byok_encrypted: null, updated_at: new Date().toISOString() })
      .eq('user_id', ownerId);
    if (error) {
      throw new Error(error.message);
    }
  }

  private client() {
    const client = this.supabase.getClient();
    if (!client) {
      throw new Error('Supabase is not configured');
    }
    return client;
  }
}
