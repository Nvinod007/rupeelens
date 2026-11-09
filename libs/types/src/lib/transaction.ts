export const TRANSACTION_STATUSES = ['draft', 'saved'] as const;

export type TransactionStatus = (typeof TRANSACTION_STATUSES)[number];

/** Transaction as returned by the API. */
export type Transaction = {
  id: string;
  title: string;
  amount: number;
  category: string | null;
  /** ISO-8601 timestamp. */
  bookedAt: string;
  status: TransactionStatus;
  notes: string | null;
  transcript: string | null;
};

/** Editable fields shown in the review / edit form. */
export type DraftTransaction = {
  title: string;
  amount: number;
  category: string;
  /** ISO-8601 timestamp. */
  bookedAt: string;
  notes: string;
};

export type CreateTransactionRequest = {
  title: string;
  amount: number;
  status: TransactionStatus;
  category?: string;
  bookedAt?: string;
  notes?: string;
  transcript?: string;
};

export type UpdateTransactionRequest = Partial<CreateTransactionRequest>;

export const DEFAULT_CATEGORY = 'Uncategorized';

/** Suggested categories; also steers the AI. Per-user categories come later. */
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Transport',
  'Shopping',
  'Bills & Utilities',
  'Entertainment',
  'Health',
  'Travel',
  'Education',
  'Rent',
  'Other',
] as const;

export const TRANSACTION_LIMITS = {
  amountMax: 1_000_000_000,
  categoryMaxLength: 60,
  notesMaxLength: 1_000,
  titleMaxLength: 120,
  transcriptMaxLength: 1_000,
} as const;
