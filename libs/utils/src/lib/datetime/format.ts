const shortDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** e.g. "5 Jun 2026" for ledger dates. */
export function formatShortDate(value: Date | string): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return shortDateFormatter.format(date);
}
