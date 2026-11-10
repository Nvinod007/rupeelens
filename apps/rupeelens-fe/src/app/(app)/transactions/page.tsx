'use client';

import { useMemo, useState } from 'react';

import { CategoryField } from '@/components/common/CategoryField';
import { SegmentedFilter } from '@/components/common/SegmentedFilter';
import { TransactionRow } from '@/components/home/TransactionRow';
import { TransactionsSkeleton } from '@/components/home/TransactionsSkeleton';
import { useDebouncedValue } from '@/lib/hooks/useDebouncedValue';
import { useLoadMoreSentinel } from '@/lib/hooks/useLoadMoreSentinel';
import { useTransactionEditor } from '@/lib/hooks/useTransactionEditor';
import { useTransactionList } from '@/lib/queries/transactions';
import type { TransactionStatus } from '@shared-types';
import { DEFAULT_CATEGORY } from '@shared-types';

const SEARCH_DEBOUNCE_MS = 350;

const STATUS_FILTERS: { id: '' | TransactionStatus; label: string }[] = [
  { id: '', label: 'All' },
  { id: 'saved', label: 'Saved' },
  { id: 'draft', label: 'Drafts' },
];

export default function TransactionsPage() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORY);
  const [status, setStatus] = useState<'' | TransactionStatus>('');

  const debouncedQ = useDebouncedValue(q.trim(), SEARCH_DEBOUNCE_MS);

  const filters = useMemo(
    () => ({
      category: category.trim() || undefined,
      limit: 50,
      q: debouncedQ || undefined,
      status: status || undefined,
    }),
    [category, debouncedQ, status]
  );

  const listQuery = useTransactionList(filters);
  const editor = useTransactionEditor();

  const rows = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [listQuery.data]
  );

  const { fetchNextPage, hasNextPage, isFetchingNextPage } = listQuery;
  const sentinelRef = useLoadMoreSentinel<HTMLDivElement>({
    enabled: Boolean(hasNextPage) && !isFetchingNextPage,
    onLoadMore: () => void fetchNextPage(),
  });
  const refreshing = listQuery.isPlaceholderData || q.trim() !== debouncedQ;

  return (
    <>
      <header className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold md:text-2xl">Transactions</h1>
        <p className="text-sm text-muted-foreground">
          Search and filter your full history.
        </p>
      </header>

      <div className="mb-6 space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Search</span>
          <input
            type="search"
            className="field-input h-10 w-full"
            placeholder="Title or notes…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block min-w-0 space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">Category</span>
            <CategoryField
              mode="filter"
              value={category}
              onChange={setCategory}
            />
          </label>
          <SegmentedFilter
            label="Status"
            value={status}
            options={STATUS_FILTERS}
            onChange={setStatus}
            ariaLabel="Transaction status"
          />
        </div>
      </div>

      {listQuery.isLoading ? (
        <TransactionsSkeleton />
      ) : listQuery.isError || rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transactions found.</p>
      ) : (
        <ul
          className={`grid gap-3 transition-opacity duration-150 ${
            refreshing ? 'opacity-60' : ''
          }`}
          aria-busy={refreshing}
        >
          {rows.map((tx) => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              onSelect={() => editor.openTransaction(tx)}
            />
          ))}
        </ul>
      )}

      {hasNextPage ? (
        <div
          ref={sentinelRef}
          className="mt-6 flex min-h-10 justify-center"
        >
          <button
            type="button"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium"
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      ) : null}

      {editor.sheet}
    </>
  );
}
