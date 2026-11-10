import type { Transaction } from '@shared-types';
import { formatInr } from '@shared-utils';
import { memo } from 'react';

import { isLocalTransactionId } from '@/lib/offline-queue';

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(iso));
}

type TransactionRowProps = {
  transaction: Transaction;
  onSelect?: () => void;
};

export const TransactionRow = memo(function TransactionRow({
  transaction,
  onSelect,
}: TransactionRowProps) {
  return (
    <li
      className={`glass-card flex items-center justify-between gap-3 p-4 ${
        onSelect ? 'cursor-pointer transition hover:border-primary/40' : ''
      }`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect();
        }
      }}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-medium">{transaction.title}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDate(transaction.bookedAt)}</span>
          {transaction.category ? (
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
              {transaction.category}
            </span>
          ) : null}
          {isLocalTransactionId(transaction.id) ? (
            <span className="rounded-full bg-sky-500/20 px-2 py-0.5 font-medium text-sky-200">
              Saved locally
            </span>
          ) : (
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                transaction.status === 'draft'
                  ? 'bg-amber-500/20 text-amber-200'
                  : 'bg-primary/20 text-primary'
              }`}
            >
              {transaction.status === 'draft' ? 'Draft' : 'Saved'}
            </span>
          )}
        </div>
      </div>
      <p className="shrink-0 text-right text-lg font-semibold tabular-nums text-foreground">
        {formatInr(transaction.amount)}
      </p>
    </li>
  );
});
