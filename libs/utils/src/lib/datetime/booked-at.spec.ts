import { clampBookedAtToNow, isBookedAtInFuture } from './booked-at';

const now = new Date('2026-11-10T10:00:00.000Z');

describe('isBookedAtInFuture', () => {
  it('is false at and before now', () => {
    expect(isBookedAtInFuture(now.toISOString(), now)).toBe(false);
    expect(isBookedAtInFuture('2026-11-09T10:00:00.000Z', now)).toBe(false);
  });

  it('is true strictly after now', () => {
    expect(isBookedAtInFuture('2026-11-11T00:00:00.000Z', now)).toBe(true);
    expect(isBookedAtInFuture('2027-01-01T00:00:00.000Z', now)).toBe(true);
  });

  it('treats invalid ISO as not future', () => {
    expect(isBookedAtInFuture('not-a-date', now)).toBe(false);
  });
});

describe('clampBookedAtToNow', () => {
  it('keeps past timestamps unchanged', () => {
    const past = '2026-11-08T12:00:00.000Z';
    expect(clampBookedAtToNow(past, now)).toBe(past);
  });

  it('clamps future timestamps to now', () => {
    expect(clampBookedAtToNow('2027-06-01T00:00:00.000Z', now)).toBe(
      now.toISOString()
    );
  });

  it('uses now for garbage input', () => {
    expect(clampBookedAtToNow('', now)).toBe(now.toISOString());
  });
});
