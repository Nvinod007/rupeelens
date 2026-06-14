import { Injectable } from "@nestjs/common";

import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTransactionsForUser(userId: string) {
    return this.prisma.transaction.findMany({
      include: {
        account: {
          select: {
            bankName: true,
            maskedAccountNumber: true,
          },
        },
      },
      orderBy: { bookedAt: "desc" },
      where: {
        account: { userId },
      },
    });
  }
}
