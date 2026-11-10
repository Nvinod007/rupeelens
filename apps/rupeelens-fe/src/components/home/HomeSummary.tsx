'use client';

import type { Transaction } from '@shared-types';
import {
  formatInr,
  maxDateLocalValue,
  resolveSpendRange,
  type CustomRangeYmd,
  type SpendPeriod,
  transactionInSpendRange,
} from '@shared-utils';

type HomeSummaryProps = {
  transactions: Transaction[];
  period: SpendPeriod;
  onPeriodChange: (period: SpendPeriod) => void;
  customRange: CustomRangeYmd;
  onCustomRangeChange: (range: CustomRangeYmd) => void;
};

const PERIODS: { id: SpendPeriod; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'year', label: 'Year' },
  { id: 'custom', label: 'Custom' },
  { id: 'all', label: 'All' },
];

export function HomeSummary({
  transactions,
  period,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
}: HomeSummaryProps) {
  const now = new Date();
  const range = resolveSpendRange(
    period,
    now,
    period === 'custom' ? customRange : undefined
  );
  const inPeriod = transactions.filter(
    (t) => t.status === 'saved' && transactionInSpendRange(t.bookedAt, range)
  );
  const spend = inPeriod.reduce((sum, t) => sum + Number(t.amount), 0);
  const drafts = transactions.filter((t) => t.status === 'draft').length;
  const maxDate = maxDateLocalValue(now);

  return (
    <section aria-label="Summary" className="mb-6 space-y-3">
      <div
        className="flex flex-wrap gap-1 rounded-lg border border-border bg-muted/30 p-1"
        role="tablist"
        aria-label="Spend period"
      >
        {PERIODS.map((p) => (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={period === p.id}
            onClick={() => onPeriodChange(p.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium sm:text-sm ${
              period === p.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {period === 'custom' ? (
        <div className="flex flex-wrap items-end gap-3 text-sm">
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">From</span>
            <input
              type="date"
              className="field-input"
              max={maxDate}
              value={customRange.from}
              onChange={(e) =>
                onCustomRangeChange({ ...customRange, from: e.target.value })
              }
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-muted-foreground">To</span>
            <input
              type="date"
              className="field-input"
              max={maxDate}
              value={customRange.to}
              onChange={(e) =>
                onCustomRangeChange({ ...customRange, to: e.target.value })
              }
            />
          </label>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card p-4 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total spend
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums md:text-3xl">
            {formatInr(spend)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {range.label} · {inPeriod.length} saved{' '}
            {inPeriod.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            All entries
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {transactions.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Full history</p>
        </div>
        <div className="glass-card p-4 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Drafts
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{drafts}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Review before they&apos;re saved
          </p>
        </div>
      </div>
    </section>
  );
}
