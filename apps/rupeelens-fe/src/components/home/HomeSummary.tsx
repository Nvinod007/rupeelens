import type { Transaction } from '@shared-types';
import { formatInr } from '@shared-utils';

type HomeSummaryProps = {
  transactions: Transaction[];
};

export function HomeSummary({ transactions }: HomeSummaryProps) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const inMonth = transactions.filter((t) => {
    const d = new Date(t.bookedAt);
    return (
      t.status === 'saved' &&
      d.getMonth() === month &&
      d.getFullYear() === year
    );
  });
  const spend = inMonth.reduce((sum, t) => sum + t.amount, 0);
  const drafts = transactions.filter((t) => t.status === 'draft').length;

  return (
    <section
      aria-label="Summary"
      className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div className="glass-card p-4 lg:col-span-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          This month
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums md:text-3xl">
          {formatInr(spend)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Logged spend (saved entries)
        </p>
      </div>
      <div className="glass-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Entries
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">
          {transactions.length}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">In your history</p>
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
    </section>
  );
}
