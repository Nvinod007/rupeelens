import { Module } from '@nestjs/common';

import { LlmModule } from '../llm/llm.module';
import { SettingsModule } from '../settings/settings.module';
import { ParseController } from './parse.controller';
import { ParseService } from './parse.service';

@Module({
  controllers: [ParseController],
  imports: [LlmModule, SettingsModule],
  providers: [ParseService],
})
export class ParseModule {}
