'use client';

import type { CategorySpendSlice } from '@shared-utils';
import { formatInr } from '@shared-utils';
import { useId, useState } from 'react';

const SLICE_COLORS = [
  'hsl(var(--chart-1, 220 70% 50%))',
  'hsl(var(--chart-2, 160 60% 45%))',
  'hsl(var(--chart-3, 30 80% 55%))',
  'hsl(var(--chart-4, 280 65% 60%))',
  'hsl(var(--chart-5, 340 75% 55%))',
  'hsl(var(--muted-foreground))',
];

type CategorySpendChartsProps = {
  slices: CategorySpendSlice[];
};

type Arc = {
  slice: CategorySpendSlice;
  color: string;
  d: string;
  index: number;
  midAngle: number;
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y} Z`;
}

export function CategorySpendCharts({ slices }: CategorySpendChartsProps) {
  const tooltipId = useId();
  const [hovered, setHovered] = useState<number | null>(null);

  if (slices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No saved spend in this period to chart yet.
      </p>
    );
  }

  const cx = 50;
  const cy = 50;
  const r = 42;
  let angle = 0;
  const arcs: Arc[] = slices.map((slice, index) => {
    const sweep = slice.share * 360;
    const start = angle;
    const end = angle + sweep;
    angle = end;
    return {
      color: SLICE_COLORS[index % SLICE_COLORS.length],
      d: describeArc(cx, cy, r, start, end),
      index,
      midAngle: start + sweep / 2,
      slice,
    };
  });

  const active = hovered === null ? null : slices[hovered];

  return (
    <div className="grid items-start gap-3 lg:grid-cols-2 lg:gap-6">
      <div className="mx-auto w-full max-w-xs">
        <div
          className="mb-1 flex h-11 items-center justify-center"
          aria-live="polite"
        >
          {active ? (
            <div
              id={tooltipId}
              className="rounded-md border border-border bg-card px-3 py-2 text-center text-xs shadow-sm"
            >
              <p className="font-medium">{active.category}</p>
              <p className="text-muted-foreground">
                {formatInr(active.amount)} · {Math.round(active.share * 100)}%
              </p>
            </div>
          ) : (
            <span className="text-xs text-muted-foreground" aria-hidden>
              Category spending breakdown
            </span>
          )}
        </div>
        <svg
          viewBox="0 0 100 100"
          className="mx-auto block h-52 w-52"
          role="img"
          aria-label="Spending pie chart by category"
          onMouseLeave={() => setHovered(null)}
        >
          <title>Category spending breakdown</title>
          {arcs.map((arc) => (
            <path
              key={arc.slice.category}
              d={arc.d}
              fill={arc.color}
              opacity={hovered === null || hovered === arc.index ? 1 : 0.35}
              className="cursor-pointer outline-none transition-opacity duration-150"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHovered(arc.index)}
            />
          ))}
          <circle cx={cx} cy={cy} r={22} className="fill-background" />
        </svg>
      </div>

      <CategoryBarList
        arcs={arcs}
        hovered={hovered}
        onHover={setHovered}
        tooltipId={tooltipId}
      />
    </div>
  );
}

function CategoryBarList({
  arcs,
  hovered,
  onHover,
  tooltipId,
}: {
  arcs: Arc[];
  hovered: number | null;
  onHover: (index: number | null) => void;
  tooltipId: string;
}) {
  return (
    <ul
      className="divide-y divide-border overflow-hidden rounded-lg border border-border"
      aria-label="Category bar chart"
      onMouseLeave={() => onHover(null)}
    >
      {arcs.map((arc) => {
        const pct = Math.round(arc.slice.share * 100);
        const dim = hovered !== null && hovered !== arc.index;
        const active = hovered === arc.index;
        return (
          <li
            key={arc.slice.category}
            className={`px-3 py-2.5 transition-colors duration-150 ${
              active ? 'bg-muted/60' : 'hover:bg-muted/40'
            }`}
            onMouseEnter={() => onHover(arc.index)}
          >
            <div className="flex justify-between gap-2 text-xs">
              <span
                className={`truncate font-medium transition-opacity duration-150 ${
                  dim ? 'opacity-40' : ''
                }`}
              >
                {arc.slice.category}
              </span>
              <span
                className={`shrink-0 text-muted-foreground transition-opacity duration-150 ${
                  dim ? 'opacity-40' : ''
                }`}
                aria-describedby={tooltipId}
              >
                {formatInr(arc.slice.amount)} · {pct}%
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-sm bg-muted/80">
              <div
                className="h-full rounded-sm transition-[width,opacity] duration-150"
                style={{
                  background: arc.color,
                  opacity: dim ? 0.35 : 1,
                  width: `${Math.max(pct, 2)}%`,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
