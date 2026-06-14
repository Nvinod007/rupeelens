/** Matches Prisma `TransactionDirection` and `GET /transactions` JSON. */
export type TransactionDirection = "CREDIT" | "DEBIT";

/** Nested account fields on current `GET /transactions` responses. */
export type TransactionAccountSummary = {
  bankName: string;
  maskedAccountNumber: string;
};

/** Current `GET /transactions` row (Prisma include, JSON-serialized). */
export type Transaction = {
  id: string;
  accountId: string;
  amount: string;
  direction: TransactionDirection;
  narration: string;
  merchantName: string | null;
  category: string | null;
  bookedAt: string;
  account: TransactionAccountSummary;
};
