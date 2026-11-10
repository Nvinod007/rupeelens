'use client';

import type { Transaction } from '@shared-types';
import { memo, useCallback } from 'react';

import { TransactionsEmptyState } from '@/components/home/TransactionsEmptyState';
import { TransactionRow } from '@/components/home/TransactionRow';
import { TransactionsSkeleton } from '@/components/home/TransactionsSkeleton';

type TransactionListProps = {
  loading: boolean;
  transactions: Transaction[];
  visibleTransactions: Transaction[];
  onAdd: () => void;
  onSelect: (transaction: Transaction) => void;
};

export const TransactionList = memo(function TransactionList({
  loading,
  transactions,
  visibleTransactions,
  onAdd,
  onSelect,
}: TransactionListProps) {
  return (
    <section aria-label="Recent transactions" className="space-y-4">
      <h2 className="text-base font-semibold md:text-lg">Recent activity</h2>
      {loading ? (
        <TransactionsSkeleton />
      ) : transactions.length === 0 ? (
        <TransactionsEmptyState onAdd={onAdd} />
      ) : visibleTransactions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No saved expenses in this period. Drafts are still shown when present;
          try Week, Month, or All.
        </p>
      ) : (
        <ul className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
          {visibleTransactions.map((tx) => (
            <TransactionRowItem
              key={tx.id}
              onSelect={onSelect}
              transaction={tx}
            />
          ))}
        </ul>
      )}
    </section>
  );
});

const TransactionRowItem = memo(function TransactionRowItem({
  transaction,
  onSelect,
}: {
  transaction: Transaction;
  onSelect: (transaction: Transaction) => void;
}) {
  const handleSelect = useCallback(() => {
    onSelect(transaction);
  }, [onSelect, transaction]);

  return (
    <TransactionRow onSelect={handleSelect} transaction={transaction} />
  );
});
