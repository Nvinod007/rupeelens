import { createHash } from "node:crypto";

import { TransactionDirection } from "@prisma/client";

import {
  detectBankName,
  detectDirection,
  maskLastFour,
  matchAmount,
  parseDateFromText,
  parseSafeDate,
} from "../../../core/ingestion/parse-utils";

export type EmailMessageInput = {
  body: string;
  from: string;
  messageId?: string;
  receivedAt?: string;
  subject: string;
};

export type ParsedEmailTransaction = {
  bankName: string;
  bookedAt: Date;
  direction: TransactionDirection;
  amount: string;
  externalId: string;
  maskedAccountNumber: string;
  narration: string;
};

export function parseBankEmail(
  input: EmailMessageInput
): ParsedEmailTransaction | null {
  const text = `${input.subject}\n${stripHtml(input.body)}`.replace(
    /\s+/g,
    " "
  );
  const from = input.from.toLowerCase();

  const amount = matchAmount(text);
  if (!amount) {
    return null;
  }

  const bankName = detectBankName(from, text, "Bank (email)");
  const direction = detectDirection(text);
  const masked = maskLastFour(text, "EMAIL");

  const narration =
    text.match(/(?:info|narration|upi|ref)[:\s-]+(.{5,80})/i)?.[1]?.trim() ??
    input.subject.trim() ??
    "Bank alert";

  const bookedAt =
    parseSafeDate(input.receivedAt) ?? parseDateFromText(text) ?? new Date();

  const externalId =
    input.messageId?.trim() ||
    createHash("sha256")
      .update(`${from}|${bookedAt.toISOString()}|${amount}|${narration}`)
      .digest("hex")
      .slice(0, 32);

  return {
    amount,
    bankName,
    bookedAt,
    direction,
    externalId,
    maskedAccountNumber: masked,
    narration,
  };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ");
}
