import { Module } from "@nestjs/common";

import { SetuService } from "./setu.service";

@Module({
  exports: [SetuService],
  providers: [SetuService],
})
export class SetuModule {}
