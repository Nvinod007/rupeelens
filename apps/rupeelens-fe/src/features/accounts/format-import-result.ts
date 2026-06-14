export function formatImportResult(imported: number, skipped = 0): string {
  const base = `Imported ${imported} transaction${imported === 1 ? "" : "s"}`;
  if (skipped <= 0) {
    return base;
  }
  return `${base} (${skipped} skipped)`;
}
