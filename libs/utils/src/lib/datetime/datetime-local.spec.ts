import {
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
} from './datetime-local';

describe('datetime-local helpers', () => {
  it('round-trips a local datetime value', () => {
    const local = '2026-11-09T09:30';
    const iso = fromDateTimeLocalValue(local);
    expect(iso).not.toBeNull();
    expect(toDateTimeLocalValue(iso as string)).toBe(local);
  });

  it('returns empty / null for invalid input', () => {
    expect(toDateTimeLocalValue('not-a-date')).toBe('');
    expect(fromDateTimeLocalValue('')).toBeNull();
  });
});
