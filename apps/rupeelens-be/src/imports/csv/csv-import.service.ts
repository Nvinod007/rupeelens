import { randomUUID } from "node:crypto";

import { BadRequestException, Injectable } from "@nestjs/common";
import type { CsvImportResponseDto } from "@shared-types";

import { AccountWriterService } from "../../core/ingestion/account-writer.service";
import { persistImportRows } from "../../core/ingestion/persist-import-rows";
import { TransactionWriterService } from "../../core/ingestion/transaction-writer.service";
import { parseBankCsv } from "./csv-parser";

@Injectable()
export class CsvImportService {
  constructor(
    private readonly accounts: AccountWriterService,
    private readonly transactions: TransactionWriterService
  ) {}

  async importForUser(
    userId: string,
    csv: string,
    bankName: string,
    maskedAccountNumber?: string
  ): Promise<CsvImportResponseDto> {
    const trimmed = csv.trim();
    if (!trimmed) {
      throw new BadRequestException("csv is required");
    }
    if (!bankName.trim()) {
      throw new BadRequestException("bankName is required");
    }

    const importKey = randomUUID();
    const { rows, skipped } = parseBankCsv(trimmed, importKey);

    if (rows.length === 0) {
      throw new BadRequestException(
        "No transactions found — check CSV headers (Date, Narration, Debit/Credit)"
      );
    }

    const masked = maskedAccountNumber?.trim() || "IMPORTED";
    const result = await persistImportRows(
      this.accounts,
      this.transactions,
      userId,
      bankName.trim(),
      masked,
      rows.map((row) => ({
        amount: row.amount,
        bookedAt: row.bookedAt,
        direction: row.direction,
        externalId: row.externalId,
        narration: row.narration,
      }))
    );

    return {
      accountId: result.accountId,
      imported: result.imported,
      skipped,
    };
  }
}
