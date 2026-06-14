import type { Transaction } from "@shared-types";

/** Primary label for a transaction row (merchant, else narration). */
export function getTransactionDisplayName(transaction: Transaction): string {
  return transaction.merchantName ?? transaction.narration;
}
