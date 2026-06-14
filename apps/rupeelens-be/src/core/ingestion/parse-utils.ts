import { TransactionDirection } from "@prisma/client";

export type BankPattern = { bankName: string; pattern: RegExp };

/** Shared bank detection for email + SMS parsers. */
export const BANK_SENDER_PATTERNS: BankPattern[] = [
  { bankName: "HDFC Bank", pattern: /hdfc/i },
  { bankName: "ICICI Bank", pattern: /icici/i },
  { bankName: "Axis Bank", pattern: /axis/i },
  { bankName: "SBI", pattern: /\bsbi\b|state bank/i },
  { bankName: "IDFC Bank", pattern: /idfc/i },
  { bankName: "Kotak Bank", pattern: /kotak/i },
  { bankName: "Canara Bank", pattern: /canara|canbnk/i },
];

export function detectBankName(
  sender: string,
  text: string,
  fallback: string
): string {
  const from = sender.toLowerCase();
  for (const entry of BANK_SENDER_PATTERNS) {
    if (entry.pattern.test(from) || entry.pattern.test(text)) {
      return entry.bankName;
    }
  }
  return fallback;
}

export function matchAmount(text: string): string | null {
  const amountMatch =
    text.match(/(?:inr|rs\.?)\s*([\d,]+(?:\.\d{1,2})?)/i) ??
    text.match(/([\d,]+(?:\.\d{1,2})?)\s*(?:inr|rs\.?)/i);

  if (!amountMatch) {
    return null;
  }

  return normalizeAmount(amountMatch[1]);
}

export function normalizeAmount(raw: string): string | null {
  const value = Number.parseFloat(raw.replace(/,/g, ""));
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value.toFixed(2);
}

export function detectDirection(text: string): TransactionDirection {
  const lower = text.toLowerCase();
  if (
    lower.includes("credited") ||
    lower.includes("credit alert") ||
    lower.includes("received") ||
    lower.includes("deposited")
  ) {
    return TransactionDirection.CREDIT;
  }
  return TransactionDirection.DEBIT;
}

export function parseDateFromText(text: string): Date | null {
  const patterns = [
    /(\d{2})[-/](\d{1,2})[-/](\d{2,4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?/,
    /(\d{2})[-/](\d{2})[-/](\d{2,4})/,
    /(\d{2})-([A-Za-z]{3})-(\d{2,4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) {
      continue;
    }
    const normalized = match[0].replace(
      /(\d{2})-(\d{1,2})-(\d{2})/,
      "$1/$2/$3"
    );
    const parsed = new Date(normalized);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }
  return null;
}

export function parseSafeDate(value: string | undefined): Date | null {
  if (!value?.trim()) {
    return null;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function maskLastFour(text: string, fallback = "IMPORT"): string {
  const masked =
    text.match(/(?:a\/c|acct|account)\s*[x*]*(\d{4})/i)?.[1] ??
    text.match(/[x*]{2,}(\d{4})/i)?.[1] ??
    fallback;

  return masked.length === 4 ? `XXXX${masked}` : masked;
}
