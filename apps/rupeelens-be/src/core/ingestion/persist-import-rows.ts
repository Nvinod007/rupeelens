import { AccountSource } from "@prisma/client";

import { AccountWriterService } from "./account-writer.service";
import {
  type TransactionWriteInput,
  TransactionWriterService,
} from "./transaction-writer.service";

export async function persistImportRows(
  accounts: AccountWriterService,
  transactions: TransactionWriterService,
  userId: string,
  bankName: string,
  maskedAccountNumber: string,
  rows: TransactionWriteInput[],
  source: AccountSource = AccountSource.MANUAL
): Promise<{ accountId: string; imported: number }> {
  const masked = maskedAccountNumber.trim() || "IMPORTED";
  const externalAccountId = `manual-${userId}-${bankName.trim().toLowerCase().replace(/\s+/g, "-")}-${masked}`;

  const account = await accounts.upsert({
    bankName: bankName.trim(),
    consentId: null,
    maskedAccountNumber: masked,
    setuAccountId: externalAccountId,
    source,
    userId,
  });

  let imported = 0;
  for (const row of rows) {
    const { created } = await transactions.upsert(account.id, row);
    if (created) {
      imported += 1;
    }
  }

  return { accountId: account.id, imported };
}
