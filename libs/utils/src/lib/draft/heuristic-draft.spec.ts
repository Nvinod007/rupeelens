import { buildHeuristicDraft } from './heuristic-draft';

describe('buildHeuristicDraft', () => {
  const now = new Date('2026-11-09T04:00:00.000Z');

  it('extracts the first number as amount and first words as title', () => {
    const draft = buildHeuristicDraft('Paid 450 at Swiggy for lunch yesterday', now);
    expect(draft.amount).toBe(450);
    expect(draft.title).toBe('Paid 450 at Swiggy for');
    expect(draft.notes).toBe('Paid 450 at Swiggy for lunch yesterday');
    expect(draft.bookedAt).toBe(now.toISOString());
  });

  it('falls back to a generic title and zero amount', () => {
    const draft = buildHeuristicDraft('   ', now);
    expect(draft.amount).toBe(0);
    expect(draft.title).toBe('Expense');
  });
});
