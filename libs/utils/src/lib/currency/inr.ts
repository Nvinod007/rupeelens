const inrFormatter = new Intl.NumberFormat("en-IN", {
  currency: "INR",
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
  style: "currency",
});

/** Format a value as INR (always positive, no sign prefix). */
export function formatInr(amount: string | number): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return inrFormatter.format(Math.abs(value));
}

/** Format amount with +/- prefix for credit/debit ledger rows. */
export function formatSignedInrAmount(
  amount: string | number,
  direction: "CREDIT" | "DEBIT"
): string {
  const formatted = formatInr(amount);
  return direction === "CREDIT" ? `+${formatted}` : `-${formatted}`;
}
