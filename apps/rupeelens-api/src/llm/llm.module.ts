import { Module } from '@nestjs/common';

import { GeminiClient } from './gemini.client';
import { LlmClient } from './llm.types';

@Module({
  exports: [LlmClient],
  providers: [{ provide: LlmClient, useClass: GeminiClient }],
})
export class LlmModule {}
