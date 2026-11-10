import { Controller, Get } from '@nestjs/common';
import type { AiUsage } from '@shared-types';

import { UserId } from '../auth/current-user.decorator';
import { AiUsageService } from './ai-usage.service';

@Controller('settings/ai-usage')
export class AiUsageController {
  constructor(private readonly aiUsage: AiUsageService) {}

  @Get()
  usage(@UserId() ownerId: string): Promise<AiUsage> {
    return this.aiUsage.usage(ownerId);
  }
}
