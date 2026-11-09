import type { Transaction } from '@shared-types';

export type NewTransaction = Omit<Transaction, 'id'>;
export type TransactionPatch = Partial<NewTransaction>;

export type ListTransactionsOptions = {
  limit: number;
};

/**
 * Persistence port (DIP). `ownerId` is the authenticated user's id.
 */
export abstract class TransactionsRepository {
  abstract list(
    ownerId: string,
    options: ListTransactionsOptions
  ): Promise<Transaction[]>;

  abstract create(
    ownerId: string,
    transaction: NewTransaction
  ): Promise<Transaction>;

  /** Resolves `null` when the transaction does not exist for this owner. */
  abstract update(
    ownerId: string,
    id: string,
    patch: TransactionPatch
  ): Promise<Transaction | null>;
}
