import { Injectable } from "@nestjs/common";
import { AccountSource } from "@prisma/client";

import { PrismaService } from "../../prisma/prisma.service";

export type AccountWriteInput = {
  accountType?: string | null;
  bankName: string;
  consentId?: string | null;
  maskedAccountNumber: string;
  setuAccountId: string;
  source: AccountSource;
  userId: string;
};

@Injectable()
export class AccountWriterService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(data: AccountWriteInput) {
    return this.prisma.bankAccount.upsert({
      create: {
        accountType: data.accountType ?? null,
        bankName: data.bankName,
        consentId: data.consentId ?? null,
        maskedAccountNumber: data.maskedAccountNumber,
        setuAccountId: data.setuAccountId,
        source: data.source,
        userId: data.userId,
      },
      update: {
        accountType: data.accountType ?? null,
        bankName: data.bankName,
        isActive: true,
        maskedAccountNumber: data.maskedAccountNumber,
        source: data.source,
      },
      where: {
        userId_setuAccountId: {
          setuAccountId: data.setuAccountId,
          userId: data.userId,
        },
      },
    });
  }
}
