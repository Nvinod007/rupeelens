import { Inject, Injectable, Logger } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { supabaseConfig } from '../config/configuration';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient | null = null;

  constructor(
    @Inject(supabaseConfig.KEY)
    private readonly config: ConfigType<typeof supabaseConfig>
  ) {}

  isConfigured(): boolean {
    return this.config.enabled;
  }

  /** Returns `null` when Supabase credentials are not configured. */
  getClient(): SupabaseClient | null {
    if (!this.config.enabled || !this.config.url || !this.config.serviceRoleKey) {
      return null;
    }
    if (!this.client) {
      this.client = createClient(this.config.url, this.config.serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      this.logger.log('Supabase client ready');
    }
    return this.client;
  }
}
