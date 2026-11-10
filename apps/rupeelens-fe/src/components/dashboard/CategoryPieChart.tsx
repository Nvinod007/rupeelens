'use client';

import type { CategorySpendSlice } from '@shared-utils';
import { formatInr } from '@shared-utils';

const SLICE_COLORS = [
  'hsl(var(--chart-1, 220 70% 50%))',
  'hsl(var(--chart-2, 160 60% 45%))',
  'hsl(var(--chart-3, 30 80% 55%))',
  'hsl(var(--chart-4, 280 65% 60%))',
  'hsl(var(--chart-5, 340 75% 55%))',
  'hsl(var(--muted-foreground))',
];

type CategoryPieChartProps = {
  slices: CategorySpendSlice[];
};

export function CategoryPieChart({ slices }: CategoryPieChartProps) {
  if (slices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No saved spend in this period to chart yet.
      </p>
    );
  }

  let cursor = 0;
  const stops = slices.map((slice, i) => {
    const start = cursor;
    cursor += slice.share * 100;
    const color = SLICE_COLORS[i % SLICE_COLORS.length];
    return `${color} ${start}% ${cursor}%`;
  });

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center">
      <div
        aria-hidden
        className="mx-auto h-40 w-40 shrink-0 rounded-full border border-border shadow-sm"
        style={{
          background: `conic-gradient(${stops.join(', ')})`,
        }}
      />
      <ul className="flex-1 space-y-2 text-sm">
        {slices.map((slice, i) => (
          <li key={slice.category} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
              />
              <span className="truncate">{slice.category}</span>
            </span>
            <span className="shrink-0 text-muted-foreground">
              {formatInr(slice.amount)}{' '}
              <span className="text-xs">({Math.round(slice.share * 100)}%)</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
