/** Strip invalid characters while typing an INR amount (digits + one decimal, max 2 fraction digits). */
export function sanitizeAmountInput(raw: string): string {
  let s = raw.replace(/[^\d.]/g, '');
  const dot = s.indexOf('.');
  if (dot !== -1) {
    const intPart = s.slice(0, dot);
    const fracPart = s.slice(dot + 1).replace(/\./g, '');
    s = `${intPart}.${fracPart.slice(0, 2)}`;
  }
  return s;
}

/** Parse sanitized amount text for validation and API payloads. */
export function amountFromInput(text: string): number {
  const trimmed = text.trim();
  if (!trimmed || trimmed === '.') {
    return 0;
  }
  const amount = Number(trimmed);
  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }
  return Math.round(amount * 100) / 100;
}
