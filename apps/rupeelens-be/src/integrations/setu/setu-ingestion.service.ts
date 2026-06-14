import { Injectable, Logger } from "@nestjs/common";
import {
  AccountSource,
  ConsentStatus,
  TransactionDirection,
} from "@prisma/client";

import { AccountWriterService } from "../../core/ingestion/account-writer.service";
import { TransactionWriterService } from "../../core/ingestion/transaction-writer.service";
import { PrismaService } from "../../prisma/prisma.service";
import { SetuService } from "./client/setu.service";
import type {
  SetuFetchFiResponse,
  SetuFiAccountData,
  SetuFiTransaction,
} from "./client/setu.types";

@Injectable()
export class SetuIngestionService {
  private readonly logger = new Logger(SetuIngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly setu: SetuService,
    private readonly accounts: AccountWriterService,
    private readonly transactions: TransactionWriterService
  ) {}

  async ingestForConsent(
    setuConsentId: string,
    sessionId?: string
  ): Promise<void> {
    const consent = await this.prisma.consent.findUnique({
      where: { setuConsentId },
    });

    if (!consent) {
      this.logger.warn(`No local consent for setuConsentId=${setuConsentId}`);
      return;
    }

    if (this.setu.isMockMode()) {
      await this.ingestMockData(consent.id, consent.userId);
      return;
    }

    if (!sessionId) {
      this.logger.warn(
        `FINANCIAL_DATA_READY for ${setuConsentId} missing sessionId — skipping fetch`
      );
      return;
    }

    try {
      const fiData = await this.setu.fetchFinancialData(sessionId);
      await this.ingestFromSetuResponse(consent.id, consent.userId, fiData);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Setu fetch failed for consent ${setuConsentId}: ${message}`
      );
      throw error;
    }
  }

  async updateConsentStatus(
    setuConsentId: string,
    status: ConsentStatus
  ): Promise<void> {
    await this.prisma.consent.updateMany({
      data: { status },
      where: { setuConsentId },
    });
  }

  private async ingestMockData(
    consentId: string,
    userId: string
  ): Promise<void> {
    const setuAccountId = `mock-account-${consentId}`;
    const account = await this.accounts.upsert({
      accountType: "SAVINGS",
      bankName: "Mock Sandbox Bank",
      consentId,
      maskedAccountNumber: "XXXX1234",
      setuAccountId,
      source: AccountSource.SETU,
      userId,
    });

    const mockTxns = [
      {
        amount: "450.00",
        bookedAt: new Date(),
        direction: TransactionDirection.DEBIT,
        externalId: `mock-txn-${consentId}-1`,
        narration: "UPI/swiggy@ybl/Payment",
      },
      {
        amount: "25000.00",
        bookedAt: new Date(Date.now() - 86_400_000),
        direction: TransactionDirection.CREDIT,
        externalId: `mock-txn-${consentId}-2`,
        narration: "SALARY CREDIT",
      },
    ];

    for (const txn of mockTxns) {
      await this.transactions.upsert(account.id, txn);
    }

    this.logger.log(`Mock Setu ingestion complete for consent ${consentId}`);
  }

  private async ingestFromSetuResponse(
    consentId: string,
    userId: string,
    response: SetuFetchFiResponse
  ): Promise<void> {
    for (const block of response.FI ?? []) {
      const bankName = block.fipID ?? "Linked Bank";

      for (const accountData of block.data ?? []) {
        const setuAccountId =
          accountData.linkRefNumber ??
          accountData.maskedAccNumber ??
          accountData.account?.maskedAccNumber;

        if (!setuAccountId) {
          continue;
        }

        const masked =
          accountData.maskedAccNumber ??
          accountData.account?.maskedAccNumber ??
          "XXXXXXXX";

        const account = await this.accounts.upsert({
          accountType: accountData.account?.type ?? null,
          bankName,
          consentId,
          maskedAccountNumber: masked,
          setuAccountId,
          source: AccountSource.SETU,
          userId,
        });

        for (const txn of this.extractTransactions(accountData)) {
          await this.transactions.upsert(account.id, {
            amount: txn.amount,
            bookedAt: this.parseDate(txn.transactionTimestamp ?? txn.valueDate),
            direction: this.mapDirection(txn.type),
            externalId: txn.txnId,
            narration: txn.narration,
            rawNarration: txn.narration,
          });
        }
      }
    }
  }

  private extractTransactions(
    accountData: SetuFiAccountData
  ): SetuFiTransaction[] {
    if (accountData.transactions?.length) {
      return accountData.transactions;
    }
    return accountData.Transactions?.Transaction ?? [];
  }

  private mapDirection(type: string): TransactionDirection {
    return type.toUpperCase() === "CREDIT"
      ? TransactionDirection.CREDIT
      : TransactionDirection.DEBIT;
  }

  private parseDate(value?: string): Date {
    if (!value) {
      return new Date();
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }
}
