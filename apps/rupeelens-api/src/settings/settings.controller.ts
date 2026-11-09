import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import type { ByokStatus } from '@shared-types';

import { UserId } from '../auth/current-user.decorator';
import { SaveByokDto } from './dto/save-byok.dto';
import { SettingsService } from './settings.service';

@Controller('settings/byok')
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('status')
  async status(@UserId() ownerId: string): Promise<ByokStatus> {
    return { configured: await this.settings.isConfigured(ownerId) };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  async save(
    @UserId() ownerId: string,
    @Body() body: SaveByokDto
  ): Promise<ByokStatus> {
    await this.settings.saveByok(ownerId, body.apiKey, body.consentAccepted);
    return { configured: true };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async revoke(@UserId() ownerId: string): Promise<ByokStatus> {
    await this.settings.revokeByok(ownerId);
    return { configured: false };
  }
}
