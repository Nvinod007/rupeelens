import type { Transaction } from "@shared-types";

/** Bank SMS alerts often start with this boilerplate. */
const SMS_BOILERPLATE = /^an amount of inr/i;

/** Long narrations are usually unparsed SMS text — show bank + direction instead. */
const LONG_NARRATION_MAX = 56;

/** Primary label for a transaction row (merchant, else narration). */
export function getTransactionDisplayName(transaction: Transaction): string {
  if (transaction.merchantName) {
    return transaction.merchantName;
  }

  const narration = transaction.narration.trim();
  if (!narration) {
    return transaction.account.bankName;
  }

  if (
    SMS_BOILERPLATE.test(narration) ||
    narration.length > LONG_NARRATION_MAX
  ) {
    const label = transaction.direction === "CREDIT" ? "Credit" : "Debit";
    return `${transaction.account.bankName} · ${label}`;
  }

  return narration;
}
