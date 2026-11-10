import { amountFromInput, sanitizeAmountInput } from './amount-input';

describe('sanitizeAmountInput', () => {
  it.each([
    ['123', '123'],
    ['12.34', '12.34'],
    ['12.3456', '12.34'],
    ['e123', '123'],
    ['12e3', '123'],
    ['abc', ''],
    ['₹1,200', '1200'],
    ['..1.2..3', '.12'],
    ['.', '.'],
  ])('strips invalid chars: %j → %j', (input, expected) => {
    expect(sanitizeAmountInput(input)).toBe(expected);
  });
});

describe('amountFromInput', () => {
  it.each([
    ['', 0],
    ['.', 0],
    ['0', 0],
    ['12.345', 12.35],
    ['99999999999', 99999999999],
    ['-5', 0],
    ['NaN', 0],
  ])('parses %j as %s', (input, expected) => {
    expect(amountFromInput(input)).toBe(expected);
  });
});
