import { Module } from "@nestjs/common";

import { SetuModule } from "../client/setu.module";
import { ConsentController } from "./consent.controller";
import { ConsentService } from "./consent.service";

@Module({
  controllers: [ConsentController],
  exports: [ConsentService],
  imports: [SetuModule],
  providers: [ConsentService],
})
export class ConsentModule {}
