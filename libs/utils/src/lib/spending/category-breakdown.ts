import type { Transaction } from '@shared-types';

export type CategorySpendSlice = {
  category: string;
  amount: number;
  share: number;
};

const UNCATEGORIZED = 'Uncategorized';

/**
 * Rolls up saved (or all) expenses by category label for charts and tables.
 */
export function categorySpendBreakdown(
  transactions: Transaction[],
  options?: { savedOnly?: boolean }
): CategorySpendSlice[] {
  const savedOnly = options?.savedOnly ?? true;
  const eligible = transactions.filter(
    (t) => !savedOnly || t.status === 'saved'
  );
  const total = eligible.reduce((sum, t) => sum + Number(t.amount), 0);
  if (total <= 0) {
    return [];
  }

  const byCategory = new Map<string, number>();
  for (const t of eligible) {
    const key = (t.category?.trim() || UNCATEGORIZED);
    byCategory.set(key, (byCategory.get(key) ?? 0) + Number(t.amount));
  }

  return [...byCategory.entries()]
    .map(([category, amount]) => ({
      amount,
      category,
      share: amount / total,
    }))
    .sort((a, b) => b.amount - a.amount);
}
