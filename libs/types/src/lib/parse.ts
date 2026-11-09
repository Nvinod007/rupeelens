import type { DraftTransaction } from './transaction';

/** Structured result of parsing a voice note / prompt. */
export type ParsedDraft = DraftTransaction;

export const PARSE_TRANSCRIPT_MAX_LENGTH = 500;

export type ParseDraftRequest = {
  transcript: string;
  /** Client clock (ISO-8601) so relative dates like "yesterday" resolve correctly. */
  clientNow?: string;
  /** IANA timezone, e.g. `Asia/Kolkata`. */
  timezone?: string;
};

export type ParseSseStatusPayload = { message: string };
export type ParseSseErrorPayload = { message: string };

export type ParseSseEvent =
  | { event: 'status'; data: ParseSseStatusPayload }
  | { event: 'complete'; data: ParsedDraft }
  | { event: 'error'; data: ParseSseErrorPayload };
