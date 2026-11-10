import { toDateTimeLocalValue } from './datetime-local';

const DEFAULT_TZ = 'Asia/Kolkata';

export type SpendPeriod = 'week' | 'month' | 'year' | 'custom' | 'all';

export type SpendRange = {
  start: Date;
  end: Date;
  label: string;
};

export type CustomRangeYmd = {
  from: string;
  to: string;
};

/** `YYYY-MM-DD` in the given IANA zone. */
export function ymdInZone(date: Date, timeZone: string = DEFAULT_TZ): string {
  return new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).format(date);
}

function atStartOfDayInZone(ymd: string, timeZone: string): Date {
  if (timeZone === 'Asia/Kolkata') {
    return new Date(`${ymd}T00:00:00+05:30`);
  }
  return new Date(`${ymd}T00:00:00`);
}

function atEndOfDayInZone(ymd: string, timeZone: string): Date {
  if (timeZone === 'Asia/Kolkata') {
    return new Date(`${ymd}T23:59:59.999+05:30`);
  }
  return new Date(`${ymd}T23:59:59.999`);
}

function mondayYmdOnOrBefore(ymd: string, timeZone: string): string {
  let cursor = atStartOfDayInZone(ymd, timeZone);
  for (let i = 0; i < 7; i++) {
    const weekday = new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
    }).format(cursor);
    if (weekday === 'Mon') {
      return ymdInZone(cursor, timeZone);
    }
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }
  return ymd;
}

function periodLabel(period: SpendPeriod, ref: Date, timeZone: string): string {
  const ymd = ymdInZone(ref, timeZone);
  switch (period) {
    case 'week':
      return `This week (${mondayYmdOnOrBefore(ymd, timeZone)})`;
    case 'month':
      return new Intl.DateTimeFormat('en-IN', {
        month: 'long',
        timeZone,
        year: 'numeric',
      }).format(ref);
    case 'year':
      return ymd.slice(0, 4);
    case 'custom':
      return 'Custom range';
    default:
      return 'All time';
  }
}

export function resolveSpendRange(
  period: SpendPeriod,
  reference: Date = new Date(),
  custom?: CustomRangeYmd,
  timeZone: string = DEFAULT_TZ
): SpendRange {
  const end = reference;
  const ymd = ymdInZone(reference, timeZone);

  if (period === 'all') {
    return {
      end,
      label: 'All time',
      start: new Date(0),
    };
  }

  if (period === 'custom' && custom?.from && custom.to) {
    const from = custom.from <= custom.to ? custom.from : custom.to;
    const to = custom.from <= custom.to ? custom.to : custom.from;
    return {
      end: atEndOfDayInZone(to, timeZone).getTime() > end.getTime()
        ? end
        : atEndOfDayInZone(to, timeZone),
      label: `${from} → ${to}`,
      start: atStartOfDayInZone(from, timeZone),
    };
  }

  let startYmd: string;
  switch (period) {
    case 'week':
      startYmd = mondayYmdOnOrBefore(ymd, timeZone);
      break;
    case 'year':
      startYmd = `${ymd.slice(0, 4)}-01-01`;
      break;
    case 'month':
    default:
      startYmd = `${ymd.slice(0, 7)}-01`;
      break;
  }

  return {
    end,
    label: periodLabel(period, reference, timeZone),
    start: atStartOfDayInZone(startYmd, timeZone),
  };
}

export function transactionInSpendRange(
  bookedAt: string,
  range: SpendRange
): boolean {
  const at = Date.parse(bookedAt);
  if (Number.isNaN(at)) {
    return false;
  }
  return at >= range.start.getTime() && at <= range.end.getTime();
}

export function maxDateTimeLocalValue(now: Date = new Date()): string {
  return toDateTimeLocalValue(now.toISOString());
}

export function maxDateLocalValue(now: Date = new Date()): string {
  return ymdInZone(now);
}
