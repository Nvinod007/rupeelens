import type { Transaction } from '@shared-types';

export type CategorySpendSlice = {
  category: string;
  amount: number;
  /** Number of expenses rolled into this category. */
  count: number;
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

  const byCategory = new Map<string, { amount: number; count: number }>();
  for (const t of eligible) {
    const key = t.category?.trim() || UNCATEGORIZED;
    const current = byCategory.get(key) ?? { amount: 0, count: 0 };
    byCategory.set(key, {
      amount: current.amount + Number(t.amount),
      count: current.count + 1,
    });
  }

  return [...byCategory.entries()]
    .map(([category, { amount, count }]) => ({
      amount,
      category,
      count,
      share: amount / total,
    }))
    .sort((a, b) => b.amount - a.amount);
}
