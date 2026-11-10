'use client';

import type { SpendTimeBucket } from '@shared-utils';
import { formatInr } from '@shared-utils';
import { useMemo, useState } from 'react';

const BAR_COLORS = [
  'hsl(198 93% 55%)',
  'hsl(160 70% 42%)',
  'hsl(280 65% 58%)',
  'hsl(30 85% 55%)',
  'hsl(340 75% 58%)',
  'hsl(220 70% 55%)',
];

type SpendTrendChartsProps = {
  buckets: SpendTimeBucket[];
};

export function SpendTrendCharts({ buckets }: SpendTrendChartsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = useMemo(
    () => Math.max(...buckets.map((b) => b.amount), 1),
    [buckets]
  );

  if (buckets.length === 0) {
    return null;
  }

  const hasSpend = buckets.some((b) => b.amount > 0);
  if (!hasSpend) {
    return (
      <p className="text-sm text-muted-foreground">
        No saved spend in this period for a trend chart yet.
      </p>
    );
  }

  const dense = buckets.length > 20;
  const activeBucket = hovered === null ? null : buckets[hovered];

  return (
    <div
      className="rounded-lg border border-border bg-muted/20 p-3 sm:p-4"
      role="img"
      aria-label="Spend trend bar chart"
    >
      <div
        className="mb-2 flex h-10 items-center justify-center px-1 text-center text-xs"
        aria-live="polite"
      >
        {activeBucket && activeBucket.amount > 0 ? (
          <>
            <span className="font-medium text-foreground">{activeBucket.label}</span>
            <span className="ml-1.5 tabular-nums text-muted-foreground">
              {formatInr(activeBucket.amount)}
            </span>
          </>
        ) : null}
      </div>

      <div
        className="flex h-44 items-stretch gap-px sm:gap-0.5 md:gap-1"
        onMouseLeave={() => setHovered(null)}
      >
        {buckets.map((bucket, i) => {
          const pct = bucket.amount > 0 ? (bucket.amount / max) * 100 : 0;
          const active = hovered === i;
          const dim = hovered !== null && !active;
          const color = BAR_COLORS[i % BAR_COLORS.length];
          const barHeight =
            bucket.amount > 0
              ? `${Math.max(pct, 8)}%`
              : dense
                ? '3px'
                : '4px';

          return (
            <div
              key={bucket.key}
              className="group relative flex h-full min-w-0 flex-1 flex-col justify-end"
              onMouseEnter={() => setHovered(i)}
              title={
                bucket.amount > 0
                  ? `${bucket.label}: ${formatInr(bucket.amount)}`
                  : bucket.label
              }
            >
              <div
                className={`min-h-[3px] w-full shrink-0 rounded-t-sm transition-[height,opacity,transform] duration-150 ${
                  active ? 'scale-x-105 opacity-100' : dim ? 'opacity-25' : 'opacity-90'
                }`}
                style={{
                  background:
                    bucket.amount === 0
                      ? 'hsl(var(--muted-foreground) / 0.3)'
                      : `linear-gradient(to top, ${color}, ${color})`,
                  height: barHeight,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex justify-between gap-2 border-t border-border/60 pt-2 text-[10px] text-muted-foreground sm:text-xs">
        <span className="truncate">{buckets[0]?.label}</span>
        {buckets.length > 2 ? (
          <span className="hidden truncate sm:inline">
            {buckets[Math.floor(buckets.length / 2)]?.label}
          </span>
        ) : null}
        <span className="truncate text-right">{buckets.at(-1)?.label}</span>
      </div>
    </div>
  );
}
