import {
  resolveSpendRange,
  transactionInSpendRange,
  ymdInZone,
} from './spend-period';

const IST = 'Asia/Kolkata';
// Tue 10 Nov 2026, 15:00 IST
const ref = new Date('2026-11-10T09:30:00.000Z');

describe('resolveSpendRange', () => {
  it('month starts on the first of the IST month', () => {
    const { start, end } = resolveSpendRange('month', ref, undefined, IST);
    expect(ymdInZone(start, IST)).toBe('2026-11-01');
    expect(end.getTime()).toBe(ref.getTime());
  });

  it('week starts on the Monday of the IST week', () => {
    const { start } = resolveSpendRange('week', ref, undefined, IST);
    expect(ymdInZone(start, IST)).toBe('2026-11-09');
  });

  it('year starts 1 Jan IST', () => {
    const { start } = resolveSpendRange('year', ref, undefined, IST);
    expect(ymdInZone(start, IST)).toBe('2026-01-01');
  });

  it('custom swaps reversed dates and caps end at ref', () => {
    const { start, end, label } = resolveSpendRange(
      'custom',
      ref,
      { from: '2026-11-15', to: '2026-11-05' },
      IST
    );
    expect(ymdInZone(start, IST)).toBe('2026-11-05');
    expect(ymdInZone(end, IST)).toBe('2026-11-10');
    expect(label).toContain('2026-11-05');
  });

  it('all time starts at epoch', () => {
    const { start } = resolveSpendRange('all', ref, undefined, IST);
    expect(start.getTime()).toBe(0);
  });
});

describe('transactionInSpendRange', () => {
  const month = resolveSpendRange('month', ref, undefined, IST);

  it('includes in-range saved rows', () => {
    expect(
      transactionInSpendRange('2026-11-05T12:00:00.000Z', month)
    ).toBe(true);
  });

  it('excludes before start and after end', () => {
    expect(
      transactionInSpendRange('2026-10-20T12:00:00.000Z', month)
    ).toBe(false);
    expect(
      transactionInSpendRange('2026-11-11T12:00:00.000Z', month)
    ).toBe(false);
  });

  it('rejects invalid ISO', () => {
    expect(transactionInSpendRange('nope', month)).toBe(false);
  });
});
