import { Injectable } from '@nestjs/common';
import type { Transaction, TransactionListPage } from '@shared-types';
import {
  compareTransactionsNewestFirst,
  encodeListCursor,
  transactionBeforeCursor,
} from '@shared-utils';
import { randomUUID } from 'crypto';

import {
  type ListTransactionsOptions,
  type NewTransaction,
  TransactionsRepository,
  type TransactionPatch,
} from '../transactions.repository';

/** Volatile storage for local development and tests. */
@Injectable()
export class InMemoryTransactionsRepository extends TransactionsRepository {
  private readonly byOwner = new Map<string, Transaction[]>();

  async list(
    ownerId: string,
    options: ListTransactionsOptions
  ): Promise<TransactionListPage> {
    let rows = [...(this.byOwner.get(ownerId) ?? [])];

    if (options.status) {
      rows = rows.filter((r) => r.status === options.status);
    }
    if (options.category) {
      rows = rows.filter((r) => r.category === options.category);
    }
    if (options.q) {
      const q = options.q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.notes?.toLowerCase().includes(q) ?? false)
      );
    }

    rows.sort(compareTransactionsNewestFirst);

    if (options.cursor) {
      rows = rows.filter((r) => transactionBeforeCursor(r, options.cursor!));
    }

    const slice = rows.slice(0, options.limit + 1);
    const hasMore = slice.length > options.limit;
    const items = hasMore ? slice.slice(0, options.limit) : slice;
    const last = items.at(-1);

    return {
      items,
      nextCursor:
        hasMore && last
          ? encodeListCursor({ bookedAt: last.bookedAt, id: last.id })
          : null,
    };
  }

  async create(
    ownerId: string,
    transaction: NewTransaction
  ): Promise<Transaction> {
    const created: Transaction = { ...transaction, id: randomUUID() };
    this.byOwner.set(ownerId, [created, ...(this.byOwner.get(ownerId) ?? [])]);
    return created;
  }

  async delete(ownerId: string, id: string): Promise<boolean> {
    const transactions = this.byOwner.get(ownerId) ?? [];
    const remaining = transactions.filter((item) => item.id !== id);
    this.byOwner.set(ownerId, remaining);
    return remaining.length < transactions.length;
  }

  async update(
    ownerId: string,
    id: string,
    patch: TransactionPatch
  ): Promise<Transaction | null> {
    const transactions = this.byOwner.get(ownerId) ?? [];
    const index = transactions.findIndex((item) => item.id === id);
    if (index < 0) {
      return null;
    }

    const defined = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined)
    );
    const updated = { ...transactions[index], ...defined } as Transaction;
    transactions[index] = updated;
    return updated;
  }
}
