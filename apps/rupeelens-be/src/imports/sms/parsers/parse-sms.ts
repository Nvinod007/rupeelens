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

export type SmsMessageInput = {
  body: string;
  receivedAt?: string;
  sender: string;
};

export type ParsedSmsTransaction = {
  bankName: string;
  bookedAt: Date;
  direction: TransactionDirection;
  amount: string;
  externalId: string;
  maskedAccountNumber: string;
  narration: string;
};

export function parseBankSms(
  input: SmsMessageInput
): ParsedSmsTransaction | null {
  const text = input.body.replace(/\s+/g, " ").trim();
  const sender = input.sender.toLowerCase();

  const amount = matchAmount(text);
  if (!amount) {
    return null;
  }

  const bankName = detectBankName(sender, text, "Bank (SMS)");
  const direction = detectDirection(text);
  const masked = maskLastFour(text, "SMS");
  const narration = extractSmsNarration(text, bankName, direction);
  const bookedAt =
    parseDateFromText(text) ?? parseSafeDate(input.receivedAt) ?? new Date();

  const upiRef =
    text.match(/upi[:\s]*(\d{10,})/i)?.[1] ??
    text.match(/upi\s*ref\s*(\d+)/i)?.[1];

  const externalId = upiRef
    ? `sms-upi-${upiRef}`
    : createHash("sha256")
        .update(`${sender}|${text}|${bookedAt.toISOString()}`)
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

function extractSmsNarration(
  text: string,
  bankName: string,
  direction: TransactionDirection
): string {
  const debitParty = text.match(/;\s*([^;.]+?)\s+credited/i)?.[1]?.trim();
  if (debitParty) {
    return debitParty;
  }

  const creditParty = text.match(/\bfrom\s+([^,.]+)/i)?.[1]?.trim();
  if (creditParty && direction === TransactionDirection.CREDIT) {
    return creditParty;
  }

  const paidTo = text.match(/\bto\s+([^,]+)/i)?.[1]?.trim();
  if (paidTo && !/your account/i.test(paidTo)) {
    return paidTo;
  }

  const upi = text.match(/upi[/\s][^,]{3,60}/i)?.[0]?.trim();
  if (upi) {
    return upi;
  }

  if (/has been (debited|credited)/i.test(text)) {
    return `${bankName} · ${direction === TransactionDirection.CREDIT ? "Credit" : "Debit"}`;
  }

  return text.slice(0, 48);
}
