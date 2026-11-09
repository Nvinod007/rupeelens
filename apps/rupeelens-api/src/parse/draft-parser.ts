import { type ParsedDraft, TRANSACTION_LIMITS } from '@shared-types';
import { buildHeuristicDraft, normalizeCategory } from '@shared-utils';

const MAX_FUTURE_MS = 24 * 60 * 60 * 1000;

type RawDraft = Partial<
  Record<keyof ParsedDraft | 'isExpense' | 'rejectionReason', unknown>
>;

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
    category: normalizeCategory(
      text(parsed.category, TRANSACTION_LIMITS.categoryMaxLength)
    ),
    notes:
      text(parsed.notes, TRANSACTION_LIMITS.notesMaxLength) || fallback.notes,
    title:
      text(parsed.title, TRANSACTION_LIMITS.titleMaxLength) || fallback.title,
  };
}

const DEFAULT_REJECTION =
  'That does not look like an expense. Try something like: Swiggy 450 dinner.';

/**
 * Returns a user-facing reason when the model flagged the note as not an
 * expense (or the model gave no amount), otherwise `null`.
 */
export function readRejection(raw: string): string | null {
  const parsed = extractJsonObject(raw);
  if (!parsed || parsed.isExpense !== false) {
    return null;
  }
  return (
    text(parsed.rejectionReason, TRANSACTION_LIMITS.notesMaxLength) ||
    DEFAULT_REJECTION
  );
}

export const NO_AMOUNT_MESSAGE =
  'I could not find an amount. Add how much you spent, e.g. "Swiggy 450".';
