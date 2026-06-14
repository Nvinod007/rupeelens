import { Injectable } from "@nestjs/common";
import { Prisma, TransactionDirection } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";
import { parseMerchantFromNarration } from "./parse-merchant";

export type TransactionWriteInput = {
  amount: string;
  bookedAt: Date;
  direction: TransactionDirection;
  externalId: string;
  narration: string;
  rawNarration?: string;
};

@Injectable()
export class TransactionWriterService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(
    accountId: string,
    txn: TransactionWriteInput
  ): Promise<{ created: boolean }> {
    const merchantName = parseMerchantFromNarration(txn.narration);
    const where = {
      accountId_externalId: { accountId, externalId: txn.externalId },
    };

    const existing = await this.prisma.transaction.findUnique({ where });

    try {
      await this.prisma.transaction.upsert({
        create: {
          accountId,
          amount: new Prisma.Decimal(txn.amount),
          bookedAt: txn.bookedAt,
          direction: txn.direction,
          externalId: txn.externalId,
          merchantName,
          narration: txn.narration,
          rawNarration: txn.rawNarration ?? txn.narration,
        },
        update: {
          amount: new Prisma.Decimal(txn.amount),
          bookedAt: txn.bookedAt,
          direction: txn.direction,
          merchantName,
          narration: txn.narration,
          rawNarration: txn.rawNarration ?? txn.narration,
        },
        where,
      });
      return { created: !existing };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        return { created: false };
      }
      throw error;
    }
  }
}
