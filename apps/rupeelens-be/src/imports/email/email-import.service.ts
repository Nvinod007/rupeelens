import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import type {
  EmailImportResponseDto,
  EmailParseRequestDto,
  EmailSyncResponseDto,
  EmailSyncStatusDto,
} from "@shared-types";

import { AccountWriterService } from "../../core/ingestion/account-writer.service";
import { persistImportRows } from "../../core/ingestion/persist-import-rows";
import { TransactionWriterService } from "../../core/ingestion/transaction-writer.service";
import { PrismaService } from "../../prisma/prisma.service";
import { isEmailImapConfigured, loadEmailImapConfig } from "./email.config";
import { EmailSyncService } from "./email-sync.service";
import { type EmailMessageInput, parseBankEmail } from "./parsers/parse-email";

const FIRST_SYNC_LOOKBACK_MS = 30 * 86_400_000;

@Injectable()
export class EmailImportService {
  constructor(
    private readonly accounts: AccountWriterService,
    private readonly transactions: TransactionWriterService,
    private readonly emailSync: EmailSyncService,
    private readonly prisma: PrismaService
  ) {}

  async parseOne(
    userId: string,
    dto: EmailParseRequestDto
  ): Promise<EmailImportResponseDto> {
    const parsed = parseBankEmail({
      body: dto.body,
      from: dto.from,
      messageId: dto.messageId,
      receivedAt: dto.receivedAt,
      subject: dto.subject,
    });

    if (!parsed) {
      throw new BadRequestException(
        "Could not parse transaction from this email"
      );
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

  async getSyncStatus(userId: string): Promise<EmailSyncStatusDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      select: { lastEmailSyncAt: true },
      where: { id: userId },
    });

    return {
      imapConfigured: isEmailImapConfigured(),
      lastEmailSyncAt: user.lastEmailSyncAt?.toISOString() ?? null,
    };
  }

  async syncInbox(userId: string): Promise<EmailSyncResponseDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      select: { email: true, lastEmailSyncAt: true },
      where: { id: userId },
    });

    this.assertImapMailboxOwner(user.email);

    const since =
      user.lastEmailSyncAt ?? new Date(Date.now() - FIRST_SYNC_LOOKBACK_MS);

    const messages = await this.emailSync.fetchMessagesSince(since);

    let imported = 0;
    let skipped = 0;
    let lastAccountId = "";

    for (const message of messages) {
      const row = parseBankEmail(message);
      if (!row) {
        skipped += 1;
        continue;
      }

      const result = await persistImportRows(
        this.accounts,
        this.transactions,
        userId,
        row.bankName,
        row.maskedAccountNumber,
        [
          {
            amount: row.amount,
            bookedAt: row.bookedAt,
            direction: row.direction,
            externalId: row.externalId,
            narration: row.narration,
            rawNarration: message.body,
          },
        ]
      );
      imported += result.imported;
      lastAccountId = result.accountId;
    }

    const lastSyncAt = this.resolveLastSyncAt(messages, user.lastEmailSyncAt);
    await this.prisma.user.update({
      data: { lastEmailSyncAt: lastSyncAt },
      where: { id: userId },
    });

    return {
      accountId: lastAccountId,
      imported,
      lastSyncAt: lastSyncAt.toISOString(),
      matched: messages.length,
      skipped,
    };
  }

  /** IMAP uses one shared mailbox — only the matching signed-in user may sync. */
  private assertImapMailboxOwner(userEmail: string | null): void {
    const config = loadEmailImapConfig();
    if (!config.enabled || !config.user) {
      return;
    }

    const mailbox = config.user.trim().toLowerCase();
    const email = userEmail?.trim().toLowerCase();

    if (!email || email !== mailbox) {
      throw new ForbiddenException(
        "Email sync is single-mailbox only: your account email must match EMAIL_IMAP_USER"
      );
    }
  }

  private resolveLastSyncAt(
    messages: EmailMessageInput[],
    previous: Date | null
  ): Date {
    let maxMs = previous?.getTime() ?? 0;

    for (const message of messages) {
      if (!message.receivedAt) {
        continue;
      }
      const receivedMs = new Date(message.receivedAt).getTime();
      if (receivedMs > maxMs) {
        maxMs = receivedMs;
      }
    }

    if (messages.length === 0) {
      maxMs = Math.max(maxMs, Date.now());
    }

    return new Date(maxMs);
  }
}
