'use client';

import { HomeIntro } from '@/components/home/HomeIntro';
import { HomeOverlays } from '@/components/home/HomeOverlays';
import { HomeSummary } from '@/components/home/HomeSummary';
import { TransactionList } from '@/components/home/TransactionList';
import { SummarySkeleton } from '@/components/home/TransactionsSkeleton';
import { useTransactions } from '@/lib/queries/transactions';

import { useHomeExpenseFlow } from './home/useHomeExpenseFlow';
import { useSpendPeriodFilter } from './home/useSpendPeriodFilter';

export default function HomePage() {
  const {
    data: transactions = [],
    error: loadError,
    isError,
    isLoading: loading,
    refetch,
  } = useTransactions();
  const flow = useHomeExpenseFlow();
  const period = useSpendPeriodFilter(transactions);

  return (
    <>
      {isError ? (
        <p className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {loadError instanceof Error ? loadError.message : 'Could not load transactions.'}{' '}
          <button
            type="button"
            className="font-medium underline"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </p>
      ) : null}

      <HomeIntro
        micBlocked={flow.mic.micBlocked}
        onAdd={() => flow.add.openAdd('prompt')}
        onAddExpense={flow.mic.onFabPress}
      />

      {loading ? <SummarySkeleton /> : null}
      {transactions.length > 0 ? (
        <HomeSummary
          customRange={period.customRange}
          onCustomRangeChange={period.setCustomRange}
          onPeriodChange={period.setSpendPeriod}
          period={period.spendPeriod}
          transactions={transactions}
        />
      ) : null}

      <TransactionList
        loading={loading}
        onAdd={flow.mic.onFabPress}
        onSelect={flow.draft.openDraftEdit}
        transactions={transactions}
        visibleTransactions={period.visibleTransactions}
      />

      <HomeOverlays flow={flow} />
    </>
  );
}
