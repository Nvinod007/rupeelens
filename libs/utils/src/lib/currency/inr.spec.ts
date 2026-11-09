import { formatInr } from './inr';

describe('formatInr', () => {
  it('formats with the Indian grouping and no decimals', () => {
    expect(formatInr(125000)).toBe('₹1,25,000');
  });

  it('formats zero', () => {
    expect(formatInr(0)).toBe('₹0');
  });
});
