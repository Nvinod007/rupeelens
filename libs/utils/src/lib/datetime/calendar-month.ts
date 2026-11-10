const DEFAULT_TZ = 'Asia/Kolkata';

/** `YYYY-MM` bucket for a date in the given IANA time zone. */
export function yearMonthInZone(
  date: Date,
  timeZone: string = DEFAULT_TZ
): string {
  const ymd = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone,
    year: 'numeric',
  }).format(date);
  return ymd.slice(0, 7);
}

export function isSameCalendarMonth(
  iso: string,
  reference: Date = new Date(),
  timeZone: string = DEFAULT_TZ
): boolean {
  const booked = new Date(iso);
  if (Number.isNaN(booked.getTime())) {
    return false;
  }
  return (
    yearMonthInZone(booked, timeZone) === yearMonthInZone(reference, timeZone)
  );
}
