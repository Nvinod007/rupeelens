'use client';

import Link from 'next/link';

import { CategorySpendCharts } from '@/components/dashboard/CategorySpendCharts';
import { SpendTrendCharts } from '@/components/dashboard/SpendTrendCharts';
import { HomeSummary } from '@/components/home/HomeSummary';
import { SummarySkeleton } from '@/components/home/TransactionsSkeleton';
import { useSpendPeriodFilter } from '@/app/(app)/home/useSpendPeriodFilter';
import { useTransactions } from '@/lib/queries/transactions';
import {
  categorySpendBreakdown,
  downloadTextFile,
  resolveSpendRange,
  spendTimeSeries,
  transactionInSpendRange,
  transactionsToCsv,
  type SpendPeriod,
} from '@shared-utils';

export default function InsightsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const period = useSpendPeriodFilter(transactions);
  const now = new Date();
  const range = resolveSpendRange(
    period.spendPeriod,
    now,
    period.spendPeriod === 'custom' ? period.customRange : undefined
  );
  const inPeriod = transactions.filter(
    (t) => t.status === 'saved' && transactionInSpendRange(t.bookedAt, range)
  );
  const slices = categorySpendBreakdown(inPeriod);
  const trendBuckets = spendTimeSeries(inPeriod, period.spendPeriod, range);
  const trendCaption = trendCaptionFor(period.spendPeriod, range);

  const exportCsv = async () => {
    const csv = transactionsToCsv(inPeriod);
    downloadTextFile(
      `rupeelens-spend-${period.spendPeriod}.csv`,
      csv
    );
  };

  return (
    <>
      <header className="mb-6 space-y-1">
        <h1 className="text-xl font-semibold md:text-2xl">Insights</h1>
        <p className="text-sm text-muted-foreground">
          Where your money went in the period you pick below.
        </p>
      </header>

      {isLoading ? <SummarySkeleton /> : null}

      {transactions.length > 0 ? (
        <HomeSummary
          customRange={period.customRange}
          onCustomRangeChange={period.setCustomRange}
          onPeriodChange={period.setSpendPeriod}
          period={period.spendPeriod}
          transactions={transactions}
        />
      ) : null}

      <section aria-label="Spend over time" className="mt-8 space-y-3">
        <div>
          <h2 className="text-base font-semibold">Spend over time</h2>
          <p className="text-xs text-muted-foreground">{trendCaption}</p>
        </div>
        <SpendTrendCharts buckets={trendBuckets} />
      </section>

      <section aria-label="Category breakdown" className="mt-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold">By category</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium"
              disabled={inPeriod.length === 0}
              onClick={() => void exportCsv()}
            >
              Export CSV
            </button>
            <Link
              href="/transactions"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
            >
              All transactions
            </Link>
          </div>
        </div>
        <CategorySpendCharts slices={slices} />
      </section>
    </>
  );
}

function trendCaptionFor(period: SpendPeriod, range: ReturnType<typeof resolveSpendRange>) {
  switch (period) {
    case 'week':
    case 'month':
      return 'Daily bars — use Week or Month above.';
    case 'year':
      return 'Monthly bars for this calendar year.';
    case 'custom':
      return `Buckets follow your custom range (${range.label}).`;
    default:
      return 'Monthly bars across all saved expenses.';
  }
}
