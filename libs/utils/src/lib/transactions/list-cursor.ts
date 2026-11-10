export type TransactionCursorPayload = {
  bookedAt: string;
  id: string;
};

const SEP = '\x1e';

export function encodeListCursor(payload: TransactionCursorPayload): string {
  return Buffer.from(`${payload.bookedAt}${SEP}${payload.id}`, 'utf8').toString(
    'base64url'
  );
}

export function decodeListCursor(raw: string): TransactionCursorPayload | null {
  try {
    const text = Buffer.from(raw, 'base64url').toString('utf8');
    const idx = text.lastIndexOf(SEP);
    if (idx <= 0) {
      return null;
    }
    const bookedAt = text.slice(0, idx);
    const id = text.slice(idx + 1);
    if (!bookedAt || !id) {
      return null;
    }
    return { bookedAt, id };
  } catch {
    return null;
  }
}

/** Sort key for stable newest-first pagination (matches API). */
export function compareTransactionsNewestFirst(
  a: { bookedAt: string; id: string },
  b: { bookedAt: string; id: string }
): number {
  const byTime = Date.parse(b.bookedAt) - Date.parse(a.bookedAt);
  if (byTime !== 0) {
    return byTime;
  }
  return b.id.localeCompare(a.id);
}

export function transactionBeforeCursor(
  row: { bookedAt: string; id: string },
  cursor: TransactionCursorPayload
): boolean {
  const t = Date.parse(row.bookedAt);
  const c = Date.parse(cursor.bookedAt);
  if (t < c) {
    return true;
  }
  if (t > c) {
    return false;
  }
  return row.id < cursor.id;
}
