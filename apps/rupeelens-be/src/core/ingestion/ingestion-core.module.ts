import { Global, Module } from "@nestjs/common";

import { AccountWriterService } from "./account-writer.service";
import { TransactionWriterService } from "./transaction-writer.service";

@Global()
@Module({
  exports: [AccountWriterService, TransactionWriterService],
  providers: [AccountWriterService, TransactionWriterService],
})
export class IngestionCoreModule {}
