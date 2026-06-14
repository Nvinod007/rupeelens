import { Injectable } from "@nestjs/common";
import type { AccountDto } from "@shared-types";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async listForUser(userId: string): Promise<AccountDto[]> {
    const accounts = await this.prisma.bankAccount.findMany({
      orderBy: { createdAt: "desc" },
      where: { isActive: true, userId },
    });

    return accounts.map((account) => ({
      bankName: account.bankName,
      createdAt: account.createdAt.toISOString(),
      id: account.id,
      maskedAccountNumber: account.maskedAccountNumber,
      source: account.source,
    }));
  }
}
