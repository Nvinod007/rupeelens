import type { Transaction } from '@shared-types';

import {
  type SpendPeriod,
  type SpendRange,
  ymdInZone,
} from '../datetime/spend-period';

export type SpendTimeBucket = {
  key: string;
  label: string;
  amount: number;
};

const DEFAULT_TZ = 'Asia/Kolkata';

function monthKey(bookedAt: string): string {
  return ymdInZone(new Date(bookedAt), DEFAULT_TZ).slice(0, 7);
}

function dayKey(bookedAt: string): string {
  return ymdInZone(new Date(bookedAt), DEFAULT_TZ);
}

function formatDayLabel(ymd: string): string {
  const d = new Date(`${ymd}T12:00:00+05:30`);
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    timeZone: DEFAULT_TZ,
  }).format(d);
}

function formatMonthLabel(ym: string): string {
  const d = new Date(`${ym}-01T12:00:00+05:30`);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    timeZone: DEFAULT_TZ,
    year: '2-digit',
  }).format(d);
}

function addDaysYmd(ymd: string, days: number): string {
  const d = new Date(`${ymd}T12:00:00+05:30`);
  d.setDate(d.getDate() + days);
  return ymdInZone(d, DEFAULT_TZ);
}

function addMonthsYm(ym: string, months: number): string {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + months, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function rangeDaySpan(range: SpendRange): number {
  const start = ymdInZone(range.start, DEFAULT_TZ);
  const end = ymdInZone(range.end, DEFAULT_TZ);
  const a = new Date(`${start}T12:00:00+05:30`).getTime();
  const b = new Date(`${end}T12:00:00+05:30`).getTime();
  return Math.max(1, Math.round((b - a) / (24 * 60 * 60 * 1000)) + 1);
}

function useDailyBuckets(period: SpendPeriod, range: SpendRange): boolean {
  if (period === 'week' || period === 'month') {
    return true;
  }
  if (period === 'custom') {
    return rangeDaySpan(range) <= 45;
  }
  return false;
}

function enumerateDays(range: SpendRange): string[] {
  let cursor = ymdInZone(range.start, DEFAULT_TZ);
  const end = ymdInZone(range.end, DEFAULT_TZ);
  const out: string[] = [];
  while (cursor <= end) {
    out.push(cursor);
    cursor = addDaysYmd(cursor, 1);
  }
  return out;
}

function enumerateMonths(range: SpendRange): string[] {
  let cursor = ymdInZone(range.start, DEFAULT_TZ).slice(0, 7);
  const end = ymdInZone(range.end, DEFAULT_TZ).slice(0, 7);
  const out: string[] = [];
  while (cursor <= end) {
    out.push(cursor);
    cursor = addMonthsYm(cursor, 1);
  }
  return out;
}

/** Daily or monthly spend totals for charts; follows the period tabs on Insights. */
export function spendTimeSeries(
  transactions: Transaction[],
  period: SpendPeriod,
  range: SpendRange
): SpendTimeBucket[] {
  const byDay = useDailyBuckets(period, range);
  const totals = new Map<string, number>();

  for (const t of transactions) {
    const key = byDay ? dayKey(t.bookedAt) : monthKey(t.bookedAt);
    totals.set(key, (totals.get(key) ?? 0) + Number(t.amount));
  }

  if (byDay) {
    return enumerateDays(range).map((key) => ({
      amount: totals.get(key) ?? 0,
      key,
      label: formatDayLabel(key),
    }));
  }

  const keys =
    period === 'all' && totals.size > 0
      ? [...totals.keys()].sort()
      : enumerateMonths(range);

  return keys.map((key) => ({
    amount: totals.get(key) ?? 0,
    key,
    label: formatMonthLabel(key),
  }));
}
