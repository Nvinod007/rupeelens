'use client';

import type { CategorySpendSlice } from '@shared-utils';
import { formatInr } from '@shared-utils';
import { useMemo, useState } from 'react';

const SLICE_COLORS = [
  'hsl(160 70% 42%)',
  'hsl(198 93% 55%)',
  'hsl(250 90% 78%)',
  'hsl(38 95% 55%)',
  'hsl(340 75% 58%)',
  'hsl(215 20% 60%)',
] as const;

const RING_RADIUS = 40;
const RING_STROKE = 11;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
/** Small gap between ring segments so neighbours stay distinct. */
const SEGMENT_GAP = 1.2;

type CategorySpendChartsProps = {
  slices: CategorySpendSlice[];
};

type Segment = {
  slice: CategorySpendSlice;
  color: string;
  index: number;
  length: number;
  offset: number;
};

const colorAt = (index: number) => SLICE_COLORS[index % SLICE_COLORS.length];
const pctOf = (share: number) => Math.round(share * 100);
const entriesLabel = (count: number) =>
  `${count} ${count === 1 ? 'entry' : 'entries'}`;
const categoriesLabel = (count: number) =>
  `${count} ${count === 1 ? 'category' : 'categories'}`;

export function CategorySpendCharts({ slices }: CategorySpendChartsProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const { segments, total, entries } = useMemo(() => {
    let offset = 0;
    const built: Segment[] = slices.map((slice, index) => {
      const length = slice.share * CIRCUMFERENCE;
      const segment = { color: colorAt(index), index, length, offset, slice };
      offset += length;
      return segment;
    });
    return {
      entries: slices.reduce((sum, s) => sum + s.count, 0),
      segments: built,
      total: slices.reduce((sum, s) => sum + s.amount, 0),
    };
  }, [slices]);

  if (slices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No saved spend in this period to chart yet.
      </p>
    );
  }

  const active = hovered === null ? null : slices[hovered];

  return (
    <div className="grid items-start gap-5 lg:grid-cols-2 lg:gap-8">
      <div className="glass-card space-y-4 p-4 sm:p-5">
        <Donut
          active={active}
          entries={entries}
          hovered={hovered}
          onHover={setHovered}
          segments={segments}
          total={total}
        />
        <Legend hovered={hovered} onHover={setHovered} segments={segments} />
      </div>

      <CategoryCards
        hovered={hovered}
        onHover={setHovered}
        segments={segments}
      />
    </div>
  );
}

function Donut({
  active,
  entries,
  hovered,
  onHover,
  segments,
  total,
}: {
  active: CategorySpendSlice | null;
  entries: number;
  hovered: number | null;
  onHover: (index: number | null) => void;
  segments: Segment[];
  total: number;
}) {
  return (
    <div className="relative mx-auto h-56 w-56 sm:h-60 sm:w-60">
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label="Spending by category"
        onMouseLeave={() => onHover(null)}
      >
        <circle
          cx="50"
          cy="50"
          r={RING_RADIUS}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={RING_STROKE}
        />
        {segments.map((s) => {
          const dim = hovered !== null && hovered !== s.index;
          const visible = Math.max(s.length - (segments.length > 1 ? SEGMENT_GAP : 0), 0.5);
          return (
            <circle
              key={s.slice.category}
              cx="50"
              cy="50"
              r={RING_RADIUS}
              fill="none"
              stroke={s.color}
              strokeWidth={hovered === s.index ? RING_STROKE + 2.5 : RING_STROKE}
              strokeDasharray={`${visible} ${CIRCUMFERENCE - visible}`}
              strokeDashoffset={-s.offset}
              className="cursor-pointer outline-none transition-[stroke-width,opacity] duration-150"
              opacity={dim ? 0.3 : 1}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => onHover(s.index)}
            />
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-10 text-center">
        <p className="max-w-full truncate text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          {active ? active.category : 'Total spent'}
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums sm:text-3xl">
          {formatInr(active ? active.amount : total)}
        </p>
        <p className="mt-1 text-xs text-primary">
          {active
            ? `${pctOf(active.share)}% · ${entriesLabel(active.count)}`
            : entriesLabel(entries)}
        </p>
      </div>
    </div>
  );
}

function Legend({
  hovered,
  onHover,
  segments,
}: {
  hovered: number | null;
  onHover: (index: number | null) => void;
  segments: Segment[];
}) {
  return (
    <ul
      className="flex flex-wrap justify-center gap-2 text-xs"
      aria-label="Legend"
      onMouseLeave={() => onHover(null)}
    >
      {segments.slice(0, 6).map((s) => (
        <li
          key={s.slice.category}
          className={`flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 transition-opacity duration-150 ${
            hovered !== null && hovered !== s.index ? 'opacity-40' : ''
          }`}
          onMouseEnter={() => onHover(s.index)}
        >
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ background: s.color }}
          />
          <span className="max-w-[7rem] truncate">{s.slice.category}</span>
          <span className="tabular-nums text-muted-foreground">
            {pctOf(s.slice.share)}%
          </span>
        </li>
      ))}
    </ul>
  );
}

function CategoryCards({
  hovered,
  onHover,
  segments,
}: {
  hovered: number | null;
  onHover: (index: number | null) => void;
  segments: Segment[];
}) {
  return (
    <section aria-label="Category breakdown" className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <h3 className="font-medium uppercase tracking-widest text-muted-foreground">
          Category breakdown
        </h3>
        <span className="text-secondary">
          {categoriesLabel(segments.length)}
        </span>
      </div>

      {/* Hover is cleared only when leaving the whole list, so moving between cards never flickers. */}
      <ul className="space-y-2" onMouseLeave={() => onHover(null)}>
        {segments.map((s) => {
          const active = hovered === s.index;
          const dim = hovered !== null && !active;
          const pct = pctOf(s.slice.share);
          return (
            <li
              key={s.slice.category}
              className={`rounded-xl border px-3.5 py-3 transition-[background-color,border-color,opacity] duration-150 ${
                active
                  ? 'border-border bg-muted/70'
                  : 'border-transparent bg-card hover:bg-muted/50'
              } ${dim ? 'opacity-50' : ''}`}
              onMouseEnter={() => onHover(s.index)}
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
                  style={{
                    background: `color-mix(in srgb, ${s.color} 18%, transparent)`,
                    color: s.color,
                  }}
                >
                  {s.slice.category.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{s.slice.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {entriesLabel(s.slice.count)} ·{' '}
                    <span style={{ color: s.color }}>{pct}%</span>
                  </p>
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums sm:text-base">
                  {formatInr(s.slice.amount)}
                </p>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{ background: s.color, width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
