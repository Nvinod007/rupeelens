import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

import { loadEmailImapConfig } from "./email.config";
import { type EmailMessageInput } from "./parsers/parse-email";

@Injectable()
export class EmailSyncService {
  private readonly logger = new Logger(EmailSyncService.name);

  async fetchMessagesSince(since: Date): Promise<EmailMessageInput[]> {
    const config = loadEmailImapConfig();
    if (!config.enabled) {
      throw new ServiceUnavailableException(
        "Email IMAP sync is disabled (set EMAIL_IMAP_ENABLED=true)"
      );
    }
    if (!config.user || !config.password) {
      throw new ServiceUnavailableException(
        "EMAIL_IMAP_USER and EMAIL_IMAP_PASSWORD are required"
      );
    }

    const client = new ImapFlow({
      auth: { pass: config.password, user: config.user },
      host: config.host,
      logger: false,
      port: config.port,
      secure: config.port === 993,
    });

    const messages: EmailMessageInput[] = [];
    let lock: Awaited<ReturnType<ImapFlow["getMailboxLock"]>> | undefined;

    try {
      await client.connect();
      lock = await client.getMailboxLock("INBOX");

      const searchResult = await client.search({ since });
      const uids = Array.isArray(searchResult) ? searchResult : [];

      for await (const message of client.fetch(uids, {
        source: true,
        uid: true,
      })) {
        if (!message.source) {
          continue;
        }

        const parsed = await simpleParser(message.source);
        const from = parsed.from?.text ?? "";
        const fromLower = from.toLowerCase();

        const matchesSender = config.senders.some((sender) =>
          fromLower.includes(sender)
        );
        if (!matchesSender) {
          continue;
        }

        const htmlBody = typeof parsed.html === "string" ? parsed.html : "";

        messages.push({
          body: parsed.text ?? htmlBody,
          from,
          messageId: parsed.messageId ?? `uid-${message.uid}`,
          receivedAt: parsed.date?.toISOString(),
          subject: parsed.subject ?? "",
        });
      }
    } catch (error) {
      if (isImapAuthError(error)) {
        throw new ServiceUnavailableException(
          "IMAP authentication failed — check EMAIL_IMAP_USER and EMAIL_IMAP_PASSWORD (Gmail requires an app password)"
        );
      }
      this.logger.error("IMAP sync failed", error);
      throw new ServiceUnavailableException(
        "IMAP sync failed — check EMAIL_IMAP_* settings"
      );
    } finally {
      lock?.release();
      await client.logout().catch(() => undefined);
    }

    this.logger.log(`Fetched ${messages.length} bank alert emails`);
    return messages;
  }
}

function isImapAuthError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "authenticationFailed" in error &&
    (error as { authenticationFailed?: boolean }).authenticationFailed === true
  );
}
