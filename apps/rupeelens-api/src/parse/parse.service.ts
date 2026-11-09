import { Injectable, Logger } from '@nestjs/common';
import type { ParseSseEvent } from '@shared-types';

import { LlmClient, type LlmErrorKind, LlmProviderError } from '../llm/llm.types';
import { SettingsService } from '../settings/settings.service';
import {
  NO_AMOUNT_MESSAGE,
  parseDraftResponse,
  readRejection,
} from './draft-parser';
import type { ParseDraftDto } from './dto/parse-draft.dto';
import {
  buildUserPrompt,
  PARSE_RESPONSE_SCHEMA,
  PARSE_SYSTEM_PROMPT,
  resolveTimeZone,
} from './parse.prompt';

/** Client clocks further than this from the server are ignored. */
const MAX_CLOCK_SKEW_MS = 24 * 60 * 60 * 1000;

const NO_KEY_MESSAGE = 'Gemini API key not configured. Add it in Settings.';
const UNREADABLE_MESSAGE = 'AI returned an unreadable answer.';

/** User-safe copy; raw upstream details stay in server logs. */
const LLM_ERROR_MESSAGES: Record<LlmErrorKind, string> = {
  invalid_credentials: 'Your Gemini API key was rejected. Check it in Settings.',
  invalid_response: UNREADABLE_MESSAGE,
  model_unavailable: 'The configured AI model is unavailable.',
  rate_limited: 'AI rate limit reached. Try again in a minute.',
  timeout: 'AI took too long to respond.',
  unavailable: 'AI is temporarily unavailable.',
};

@Injectable()
export class ParseService {
  private readonly logger = new Logger(ParseService.name);

  constructor(
    private readonly settings: SettingsService,
    private readonly llm: LlmClient
  ) {}

  /** Never throws: failures are delivered as typed `error` events. */
  async *streamDraft(
    ownerId: string,
    request: ParseDraftDto
  ): AsyncGenerator<ParseSseEvent> {
    const apiKey = await this.settings.getDecryptedKey(ownerId);
    if (!apiKey) {
      yield { data: { message: NO_KEY_MESSAGE }, event: 'error' };
      return;
    }

    yield { data: { message: 'structuring' }, event: 'status' };

    const now = this.resolveNow(request.clientNow);

    try {
      const raw = await this.llm.generateJson({
        apiKey,
        responseSchema: PARSE_RESPONSE_SCHEMA,
        systemPrompt: PARSE_SYSTEM_PROMPT,
        userPrompt: buildUserPrompt(request.transcript, {
          now,
          timeZone: resolveTimeZone(request.timezone),
        }),
      });

      const rejection = readRejection(raw);
      if (rejection) {
        yield { data: { message: rejection }, event: 'error' };
        return;
      }

      const draft = parseDraftResponse(raw, {
        now,
        transcript: request.transcript,
      });

      if (!draft) {
        yield { data: { message: UNREADABLE_MESSAGE }, event: 'error' };
      } else if (draft.amount <= 0) {
        yield { data: { message: NO_AMOUNT_MESSAGE }, event: 'error' };
      } else {
        yield { data: draft, event: 'complete' };
      }
    } catch (error) {
      yield { data: { message: this.messageFor(error) }, event: 'error' };
    }
  }

  private resolveNow(clientNow: string | undefined): Date {
    const server = new Date();
    if (!clientNow) {
      return server;
    }
    const client = new Date(clientNow);
    const usable =
      !Number.isNaN(client.getTime()) &&
      Math.abs(client.getTime() - server.getTime()) <= MAX_CLOCK_SKEW_MS;
    return usable ? client : server;
  }

  private messageFor(error: unknown): string {
    if (error instanceof LlmProviderError) {
      return LLM_ERROR_MESSAGES[error.kind];
    }
    this.logger.error('Unexpected parse failure', error as Error);
    return LLM_ERROR_MESSAGES.unavailable;
  }
}
