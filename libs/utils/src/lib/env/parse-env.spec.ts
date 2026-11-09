import { parseBoolean, parseCsv, parsePositiveInt } from './parse-env';

describe('parse-env', () => {
  it('parses booleans with a fallback', () => {
    expect(parseBoolean('TRUE')).toBe(true);
    expect(parseBoolean('0')).toBe(false);
    expect(parseBoolean(undefined, true)).toBe(true);
  });

  it('parses csv, trimming and dropping blanks', () => {
    expect(parseCsv(' a, b ,, c ')).toEqual(['a', 'b', 'c']);
    expect(parseCsv(undefined)).toEqual([]);
  });

  it('parses positive integers with a fallback', () => {
    expect(parsePositiveInt('4001', 3000)).toBe(4001);
    expect(parsePositiveInt('-1', 3000)).toBe(3000);
    expect(parsePositiveInt('abc', 3000)).toBe(3000);
  });
});
