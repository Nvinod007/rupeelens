import { verifySupabaseAccessToken } from "@auth/server";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SupabaseAuthClaims } from "@shared-types";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

@Injectable()
export class SupabaseAuthService {
  private client: SupabaseClient | null = null;

  constructor(private readonly config: ConfigService) {}

  private getClient(): SupabaseClient {
    if (this.client) {
      return this.client;
    }

    const url = this.config.get<string>("SUPABASE_URL");
    const anonKey = this.config.get<string>("SUPABASE_ANON_KEY");

    if (!url || !anonKey) {
      throw new Error("Supabase not configured");
    }

    this.client = createClient(url, anonKey);
    return this.client;
  }

  async verifyAccessToken(accessToken: string): Promise<SupabaseAuthClaims> {
    return verifySupabaseAccessToken(this.getClient(), accessToken);
  }
}
