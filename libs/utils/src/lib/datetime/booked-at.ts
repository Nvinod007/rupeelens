/** Expense time cannot be after `now` (strict — no future dates). */
export function clampBookedAtToNow(iso: string, now: Date = new Date()): string {
  const booked = new Date(iso);
  if (Number.isNaN(booked.getTime())) {
    return now.toISOString();
  }
  return booked.getTime() > now.getTime() ? now.toISOString() : booked.toISOString();
}

export function isBookedAtInFuture(iso: string, now: Date = new Date()): boolean {
  const at = Date.parse(iso);
  return !Number.isNaN(at) && at > now.getTime();
}
