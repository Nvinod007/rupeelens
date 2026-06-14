import { Module } from "@nestjs/common";

import { SetuModule } from "./client/setu.module";
import { SetuIngestionService } from "./setu-ingestion.service";

@Module({
  exports: [SetuIngestionService],
  imports: [SetuModule],
  providers: [SetuIngestionService],
})
export class SetuIngestionModule {}
