import { isLikelyGeminiKey, redactSecret } from './gemini-key';

describe('gemini-key', () => {
  it('accepts known prefixes of sufficient length', () => {
    expect(isLikelyGeminiKey('AIza' + 'x'.repeat(30))).toBe(true);
    expect(isLikelyGeminiKey('AQ.' + 'x'.repeat(30))).toBe(true);
  });

  it('rejects short or unknown values', () => {
    expect(isLikelyGeminiKey('AIza')).toBe(false);
    expect(isLikelyGeminiKey('sk-' + 'x'.repeat(30))).toBe(false);
  });

  it('never reveals the full secret', () => {
    expect(redactSecret('AIzaSyD1234567890abcdef')).toBe('AIza…cdef');
    expect(redactSecret('short')).toBe('****');
    expect(redactSecret(undefined)).toBe('[empty]');
  });
});
