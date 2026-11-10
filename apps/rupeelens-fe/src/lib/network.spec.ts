import {
  assertBrowserOnline,
  isBrowserOffline,
  isNetworkFailure,
  OFFLINE_MESSAGE,
  toUserNetworkError,
} from './network';

describe('network helpers', () => {
  const original = navigator.onLine;

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: original,
    });
  });

  it('detects offline from navigator', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    });
    expect(isBrowserOffline()).toBe(true);
    expect(() => assertBrowserOnline()).toThrow(OFFLINE_MESSAGE);
  });

  it('classifies fetch TypeError as network failure', () => {
    expect(isNetworkFailure(new TypeError('Failed to fetch'))).toBe(true);
    expect(toUserNetworkError(new TypeError('Failed to fetch')).message).toBe(
      OFFLINE_MESSAGE
    );
  });

  it('maps AbortError to timeout message', () => {
    const err = new DOMException('aborted', 'AbortError');
    expect(isNetworkFailure(err)).toBe(false);
    expect(toUserNetworkError(err).message).toMatch(/timed out/i);
  });

  it('preserves API validation messages', () => {
    const err = new Error('Amount must be positive');
    expect(toUserNetworkError(err)).toBe(err);
  });
});
