import type { Transaction, TransactionListPage, TransactionStatus } from '@shared-types';
import type { TransactionCursorPayload } from '@shared-utils';

export type NewTransaction = Omit<Transaction, 'id'>;
export type TransactionPatch = Partial<NewTransaction>;

export type ListTransactionsOptions = {
  limit: number;
  cursor?: TransactionCursorPayload;
  q?: string;
  category?: string;
  status?: TransactionStatus;
};

/**
 * Persistence port (DIP). `ownerId` is the authenticated user's id.
 */
export abstract class TransactionsRepository {
  abstract list(
    ownerId: string,
    options: ListTransactionsOptions
  ): Promise<TransactionListPage>;

  abstract create(
    ownerId: string,
    transaction: NewTransaction
  ): Promise<Transaction>;

  /** Removes the transaction; resolves `false` when it does not exist for this owner. */
  abstract delete(ownerId: string, id: string): Promise<boolean>;

  /** Resolves `null` when the transaction does not exist for this owner. */
  abstract update(
    ownerId: string,
    id: string,
    patch: TransactionPatch
  ): Promise<Transaction | null>;
}
