import type { Transaction, TransactionStatus } from './transaction';

export type TransactionListPage = {
  items: Transaction[];
  /** Opaque cursor; pass as `cursor` query param for the next page. */
  nextCursor: string | null;
};

export type ListTransactionsParams = {
  limit?: number;
  cursor?: string;
  /** Case-insensitive match on title and notes. */
  q?: string;
  category?: string;
  status?: TransactionStatus;
};

export const TRANSACTION_PAGE_DEFAULT = 50;
export const TRANSACTION_PAGE_MAX = 100;
