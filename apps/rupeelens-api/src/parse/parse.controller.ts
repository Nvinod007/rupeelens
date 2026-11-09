import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { SSE_EVENTS } from '@shared-types';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';

import { UserId } from '../auth/current-user.decorator';
import { RATE_LIMITS } from '../config/config.constants';
import { SseStream } from '../common/http/sse-stream';
import { ParseDraftDto } from './dto/parse-draft.dto';
import { ParseService } from './parse.service';

@Controller('parse')
export class ParseController {
  private readonly logger = new Logger(ParseController.name);

  constructor(private readonly parse: ParseService) {}

  @Throttle({ default: RATE_LIMITS.parse })
  @Post('draft')
  @HttpCode(HttpStatus.OK)
  async streamDraft(
    @UserId() ownerId: string,
    @Body() body: ParseDraftDto,
    @Res() response: Response
  ): Promise<void> {
    const stream = new SseStream(response);
    stream.open();

    try {
      for await (const message of this.parse.streamDraft(ownerId, body)) {
        stream.send(message.event, message.data);
      }
    } catch (error) {
      this.logger.error('SSE stream failed', error as Error);
      stream.send(SSE_EVENTS.error, { message: 'Parse failed' });
    } finally {
      stream.close();
    }
  }
}
