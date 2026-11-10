import type { Transaction } from '@shared-types';

const csvCell = (value: string) => {
  const v = value.replace(/"/g, '""');
  return /[",\n\r]/.test(v) ? `"${v}"` : v;
};

/** Builds a CSV string suitable for download (UTF-8). */
export function transactionsToCsv(rows: Transaction[]): string {
  const header = [
    'id',
    'title',
    'amount',
    'category',
    'booked_at',
    'status',
    'notes',
  ].join(',');

  const lines = rows.map((t) =>
    [
      t.id,
      csvCell(t.title),
      String(t.amount),
      csvCell(t.category ?? ''),
      t.bookedAt,
      t.status,
      csvCell(t.notes ?? ''),
    ].join(',')
  );

  return [header, ...lines].join('\n');
}

export function downloadTextFile(
  filename: string,
  content: string,
  mime = 'text/csv;charset=utf-8'
): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
