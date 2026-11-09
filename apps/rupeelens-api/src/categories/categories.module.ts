import { Logger, Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import { storageConfig } from '../config/configuration';
import { SupabaseService } from '../database/supabase.service';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';
import { CategoriesService } from './categories.service';
import { InMemoryCategoriesRepository } from './repositories/in-memory-categories.repository';
import { SupabaseCategoriesRepository } from './repositories/supabase-categories.repository';

@Module({
  controllers: [CategoriesController],
  providers: [
    InMemoryCategoriesRepository,
    SupabaseCategoriesRepository,
    CategoriesService,
    {
      inject: [
        storageConfig.KEY,
        SupabaseService,
        SupabaseCategoriesRepository,
        InMemoryCategoriesRepository,
      ],
      provide: CategoriesRepository,
      useFactory: (
        storage: ConfigType<typeof storageConfig>,
        supabase: SupabaseService,
        supabaseRepository: SupabaseCategoriesRepository,
        memoryRepository: InMemoryCategoriesRepository
      ): CategoriesRepository => {
        const useSupabase =
          storage.transactions === 'supabase' ||
          (storage.transactions === 'auto' && supabase.isConfigured());
        new Logger('CategoriesModule').log(
          `Storage: ${useSupabase ? 'supabase' : 'in-memory'}`
        );
        return useSupabase ? supabaseRepository : memoryRepository;
      },
    },
  ],
})
export class CategoriesModule {}
