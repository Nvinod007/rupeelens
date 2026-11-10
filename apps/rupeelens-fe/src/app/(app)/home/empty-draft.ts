import { DEFAULT_CATEGORY, type DraftTransaction } from '@shared-types';

export const emptyDraft = (): DraftTransaction => ({
  amount: 0,
  bookedAt: new Date().toISOString(),
  category: DEFAULT_CATEGORY,
  notes: '',
  title: 'Expense',
});
