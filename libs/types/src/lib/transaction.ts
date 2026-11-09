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

/** Suggested categories; also steers the AI. Users may also type their own. */
export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Groceries',
  'Coffee & Snacks',
  'Transport',
  'Fuel',
  'Cab & Auto',
  'Shopping',
  'Clothing',
  'Electronics',
  'Bills & Utilities',
  'Mobile & Internet',
  'Electricity',
  'Rent',
  'Home & Maintenance',
  'Entertainment',
  'Subscriptions',
  'Movies & Events',
  'Health',
  'Medicines',
  'Fitness',
  'Personal Care',
  'Travel',
  'Hotels & Stay',
  'Education',
  'Books & Courses',
  'Gifts & Donations',
  'Insurance',
  'Investments',
  'EMI & Loans',
  'Taxes & Fees',
  'Kids & Family',
  'Pets',
  'Business',
  'Other',
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const OTHER_CATEGORY: ExpenseCategory = 'Other';

/** No category is preselected: the user picks one or types their own. */
export const DEFAULT_CATEGORY = '';

export const TRANSACTION_LIMITS = {
  amountMax: 1_000_000_000,
  categoryMaxLength: 60,
  notesMaxLength: 1_000,
  titleMaxLength: 120,
  transcriptMaxLength: 1_000,
} as const;

/** A category the user added on top of {@link EXPENSE_CATEGORIES}. */
export type UserCategory = {
  id: string;
  name: string;
};

export type CreateCategoryRequest = {
  name: string;
};

/** Per-user cap on custom categories (abuse guard). */
export const CUSTOM_CATEGORY_LIMIT = 50;
