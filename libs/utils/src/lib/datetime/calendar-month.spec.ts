import { isSameCalendarMonth, yearMonthInZone } from './calendar-month';

const IST = 'Asia/Kolkata';

describe('yearMonthInZone', () => {
  it('buckets by IST calendar month', () => {
    // 2026-11-09 23:30 UTC = 2026-11-10 05:00 IST
    expect(
      yearMonthInZone(new Date('2026-11-09T23:30:00.000Z'), IST)
    ).toBe('2026-11');
    // 2026-10-31 20:00 UTC = 2026-11-01 01:30 IST
    expect(
      yearMonthInZone(new Date('2026-10-31T20:00:00.000Z'), IST)
    ).toBe('2026-11');
  });
});

describe('isSameCalendarMonth', () => {
  const ref = new Date('2026-11-10T12:00:00.000Z');

  it('matches another instant in the same IST month', () => {
    expect(
      isSameCalendarMonth('2026-11-01T00:00:00.000Z', ref, IST)
    ).toBe(true);
  });

  it('rejects adjacent months in IST', () => {
    expect(
      isSameCalendarMonth('2026-10-31T18:29:59.000Z', ref, IST)
    ).toBe(false);
    expect(
      isSameCalendarMonth('2026-12-01T00:00:00.000Z', ref, IST)
    ).toBe(false);
  });

  it('rejects invalid bookedAt', () => {
    expect(isSameCalendarMonth('invalid', ref, IST)).toBe(false);
  });
});
