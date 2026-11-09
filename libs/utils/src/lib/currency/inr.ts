const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  currency: 'INR',
  maximumFractionDigits: 0,
  style: 'currency',
});

export function formatInr(amount: number): string {
  return INR_FORMATTER.format(amount);
}
