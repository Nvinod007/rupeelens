import { DEFAULT_CATEGORY, type DraftTransaction } from '@shared-types';

const TITLE_WORD_LIMIT = 5;
const FALLBACK_TITLE = 'Expense';

/**
 * Best-effort draft built without an LLM. Used as a server-side fallback and
 * to pre-fill the manual "refine" form from a raw note.
 */
export function buildHeuristicDraft(
  transcript: string,
  now: Date = new Date()
): DraftTransaction {
  const text = transcript.trim();
  const amountMatch = text.match(/(\d+(?:\.\d+)?)/);

  return {
    amount: amountMatch ? Number(amountMatch[1]) : 0,
    bookedAt: now.toISOString(),
    category: DEFAULT_CATEGORY,
    notes: text,
    title: text.split(/\s+/).slice(0, TITLE_WORD_LIMIT).join(' ') || FALLBACK_TITLE,
  };
}
