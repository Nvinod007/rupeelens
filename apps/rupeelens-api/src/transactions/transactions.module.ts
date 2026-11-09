import { Logger, Module } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';

import { storageConfig } from '../config/configuration';
import { SupabaseService } from '../database/supabase.service';
import { InMemoryTransactionsRepository } from './repositories/in-memory-transactions.repository';
import { SupabaseTransactionsRepository } from './repositories/supabase-transactions.repository';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsService } from './transactions.service';

@Module({
  controllers: [TransactionsController],
  exports: [TransactionsService],
  providers: [
    InMemoryTransactionsRepository,
    SupabaseTransactionsRepository,
    TransactionsService,
    {
      inject: [
        storageConfig.KEY,
        SupabaseService,
        SupabaseTransactionsRepository,
        InMemoryTransactionsRepository,
      ],
      provide: TransactionsRepository,
      useFactory: (
        storage: ConfigType<typeof storageConfig>,
        supabase: SupabaseService,
        supabaseRepository: SupabaseTransactionsRepository,
        memoryRepository: InMemoryTransactionsRepository
      ): TransactionsRepository => {
        const useSupabase =
          storage.transactions === 'supabase' ||
          (storage.transactions === 'auto' && supabase.isConfigured());
        new Logger('TransactionsModule').log(
          `Storage: ${useSupabase ? 'supabase' : 'in-memory'}`
        );
        return useSupabase ? supabaseRepository : memoryRepository;
      },
    },
  ],
})
export class TransactionsModule {}
