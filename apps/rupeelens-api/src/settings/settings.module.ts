import { Module } from '@nestjs/common';

import { SupabaseService } from '../database/supabase.service';
import { BYOK_STORES, type ByokStore } from './byok.store';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { FileByokStore } from './stores/file-byok.store';
import { SupabaseByokStore } from './stores/supabase-byok.store';

@Module({
  controllers: [SettingsController],
  exports: [SettingsService],
  providers: [
    FileByokStore,
    SupabaseByokStore,
    SettingsService,
    {
      inject: [SupabaseService, SupabaseByokStore, FileByokStore],
      provide: BYOK_STORES,
      useFactory: (
        supabase: SupabaseService,
        supabaseStore: SupabaseByokStore,
        fileStore: FileByokStore
      ): ByokStore[] =>
        supabase.isConfigured() ? [supabaseStore, fileStore] : [fileStore],
    },
  ],
})
export class SettingsModule {}
