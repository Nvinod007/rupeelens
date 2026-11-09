import { Skeleton } from '@shared-ui';

const ROW_COUNT = 6;

/** Placeholder matching `HomeSummary` while the first fetch is in flight. */
export function SummarySkeleton() {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div className="glass-card space-y-3 p-4" key={i}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

/** Placeholder rows matching `TransactionRow`. */
export function TransactionsSkeleton() {
  return (
    <ul
      aria-busy="true"
      aria-label="Loading transactions"
      className="grid gap-3 md:grid-cols-1 lg:grid-cols-2"
    >
      {Array.from({ length: ROW_COUNT }, (_, i) => (
        <li
          className="glass-card flex items-center justify-between gap-3 p-4"
          key={i}
        >
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-6 w-20" />
        </li>
      ))}
    </ul>
  );
}
