import {
  DEFAULT_CATEGORY,
  type ParsedDraft,
  TRANSACTION_LIMITS,
} from '@shared-types';
import { buildHeuristicDraft } from '@shared-utils';

const MAX_FUTURE_MS = 24 * 60 * 60 * 1000;

type RawDraft = Partial<Record<keyof ParsedDraft, unknown>>;

function extractJsonObject(raw: string): RawDraft | null {
  const attempts = [raw, raw.slice(raw.indexOf('{'), raw.lastIndexOf('}') + 1)];
  for (const candidate of attempts) {
    try {
      const value: unknown = JSON.parse(candidate);
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as RawDraft;
      }
    } catch {
      /* try next candidate */
    }
  }
  return null;
}

const text = (value: unknown, maxLength: number): string =>
  typeof value === 'string' ? value.trim().slice(0, maxLength) : '';

function normalizeAmount(value: unknown): number {
  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }
  return Math.min(Math.round(amount * 100) / 100, TRANSACTION_LIMITS.amountMax);
}

function normalizeBookedAt(value: unknown, now: Date): string {
  const parsed = typeof value === 'string' ? new Date(value) : null;
  const isUsable =
    parsed !== null &&
    !Number.isNaN(parsed.getTime()) &&
    parsed.getTime() <= now.getTime() + MAX_FUTURE_MS;
  return (isUsable ? parsed : now).toISOString();
}

/**
 * Validates and normalises the model's JSON. Never trusts model output:
 * every field is coerced, bounded and defaulted.
 * Returns `null` only when the response is not a JSON object at all.
 */
export function parseDraftResponse(
  raw: string,
  context: { transcript: string; now: Date }
): ParsedDraft | null {
  const parsed = extractJsonObject(raw);
  if (!parsed) {
    return null;
  }

  const fallback = buildHeuristicDraft(context.transcript, context.now);

  return {
    amount: normalizeAmount(parsed.amount),
    bookedAt: normalizeBookedAt(parsed.bookedAt, context.now),
    category:
      text(parsed.category, TRANSACTION_LIMITS.categoryMaxLength) ||
      DEFAULT_CATEGORY,
    notes:
      text(parsed.notes, TRANSACTION_LIMITS.notesMaxLength) || fallback.notes,
    title:
      text(parsed.title, TRANSACTION_LIMITS.titleMaxLength) || fallback.title,
  };
}
