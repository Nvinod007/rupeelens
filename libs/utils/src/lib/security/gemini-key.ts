const MIN_KEY_LENGTH = 20;
const KEY_PREFIXES = ['AIza', 'AQ.'] as const;

/** Loose check only — newer key formats must not be rejected. */
export function isLikelyGeminiKey(value: string): boolean {
  const key = value.trim();
  return (
    key.length >= MIN_KEY_LENGTH &&
    KEY_PREFIXES.some((prefix) => key.startsWith(prefix))
  );
}

/** Safe-for-logs representation of a secret. */
export function redactSecret(value: string | undefined): string {
  if (!value) {
    return '[empty]';
  }
  if (value.length <= 8) {
    return '****';
  }
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}
