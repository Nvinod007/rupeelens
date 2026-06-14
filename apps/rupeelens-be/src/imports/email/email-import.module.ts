import { Module } from "@nestjs/common";

import { EmailImportController } from "./email-import.controller";
import { EmailImportService } from "./email-import.service";
import { EmailSyncService } from "./email-sync.service";

@Module({
  controllers: [EmailImportController],
  providers: [EmailImportService, EmailSyncService],
})
export class EmailImportModule {}
