import { Injectable } from '@nestjs/common';
import type { Transaction } from '@shared-types';
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
    { limit }: ListTransactionsOptions
  ): Promise<Transaction[]> {
    return [...(this.byOwner.get(ownerId) ?? [])]
      .sort((a, b) => Date.parse(b.bookedAt) - Date.parse(a.bookedAt))
      .slice(0, limit);
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
