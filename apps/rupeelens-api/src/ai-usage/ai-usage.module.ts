import { Module } from '@nestjs/common';

import { SupabaseService } from '../database/supabase.service';
import { AiUsageController } from './ai-usage.controller';
import { AiUsageService } from './ai-usage.service';
import { AiUsageStore } from './ai-usage.store';
import { InMemoryAiUsageStore } from './stores/in-memory-ai-usage.store';
import { SupabaseAiUsageStore } from './stores/supabase-ai-usage.store';

@Module({
  controllers: [AiUsageController],
  exports: [AiUsageService],
  providers: [
    InMemoryAiUsageStore,
    SupabaseAiUsageStore,
    AiUsageService,
    {
      inject: [SupabaseService, SupabaseAiUsageStore, InMemoryAiUsageStore],
      provide: AiUsageStore,
      useFactory: (
        supabase: SupabaseService,
        supabaseStore: SupabaseAiUsageStore,
        memoryStore: InMemoryAiUsageStore
      ): AiUsageStore =>
        supabase.isConfigured() ? supabaseStore : memoryStore,
    },
  ],
})
export class AiUsageModule {}
