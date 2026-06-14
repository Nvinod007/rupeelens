import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { SmsImportRequestDto, SmsImportResponseDto } from "@shared-types";

import { AccountWriterService } from "../../core/ingestion/account-writer.service";
import { persistImportRows } from "../../core/ingestion/persist-import-rows";
import { TransactionWriterService } from "../../core/ingestion/transaction-writer.service";
import { PrismaService } from "../../prisma/prisma.service";
import { parseBankSms } from "./parsers/parse-sms";

@Injectable()
export class SmsImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly accounts: AccountWriterService,
    private readonly transactions: TransactionWriterService
  ) {}

  async importForUser(
    userId: string,
    dto: SmsImportRequestDto
  ): Promise<SmsImportResponseDto> {
    return this.ingest(userId, dto);
  }

  async importByWebhookKey(
    importKey: string,
    dto: SmsImportRequestDto
  ): Promise<SmsImportResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { importKey },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid import key");
    }

    return this.ingest(user.id, dto);
  }

  private async ingest(
    userId: string,
    dto: SmsImportRequestDto
  ): Promise<SmsImportResponseDto> {
    if (!dto.body?.trim()) {
      throw new BadRequestException("body is required");
    }

    const parsed = parseBankSms({
      body: dto.body,
      receivedAt: dto.receivedAt,
      sender: dto.sender ?? "unknown",
    });

    if (!parsed) {
      throw new BadRequestException("Could not parse transaction from SMS");
    }

    const result = await persistImportRows(
      this.accounts,
      this.transactions,
      userId,
      parsed.bankName,
      parsed.maskedAccountNumber,
      [
        {
          amount: parsed.amount,
          bookedAt: parsed.bookedAt,
          direction: parsed.direction,
          externalId: parsed.externalId,
          narration: parsed.narration,
          rawNarration: dto.body,
        },
      ]
    );

    return { ...result, skipped: 0 };
  }
}
