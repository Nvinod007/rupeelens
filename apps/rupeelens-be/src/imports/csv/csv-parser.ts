import { createHash } from "node:crypto";

import { TransactionDirection } from "@prisma/client";

export type ParsedCsvRow = {
  amount: string;
  bookedAt: Date;
  direction: TransactionDirection;
  externalId: string;
  narration: string;
};

export type CsvParseResult = {
  rows: ParsedCsvRow[];
  skipped: number;
};

const DATE_HEADERS = ["date", "transaction date", "txn date", "value date"];
const NARRATION_HEADERS = [
  "narration",
  "description",
  "particulars",
  "remarks",
  "transaction remarks",
];
const DEBIT_HEADERS = ["debit", "withdrawal", "dr", "withdrawal amt"];
const CREDIT_HEADERS = ["credit", "deposit", "cr", "deposit amt"];
const AMOUNT_HEADERS = ["amount", "transaction amount"];
const TYPE_HEADERS = ["type", "dr/cr", "cr/dr"];

export function parseBankCsv(csv: string, importKey: string): CsvParseResult {
  const lines = csv
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return { rows: [], skipped: 0 };
  }

  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = splitCsvLine(lines[0], delimiter).map(normalizeHeader);
  const rows: ParsedCsvRow[] = [];
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i], delimiter);
    if (cells.every((cell) => !cell.trim())) {
      continue;
    }

    const record = mapRow(headers, cells);
    const parsed = rowToTransaction(record, `${importKey}-${i}`);
    if (!parsed) {
      skipped += 1;
      continue;
    }
    rows.push(parsed);
  }

  return { rows, skipped };
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/"/g, "");
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  result.push(current.trim());
  return result;
}

function mapRow(headers: string[], cells: string[]): Record<string, string> {
  const record: Record<string, string> = {};
  headers.forEach((header, index) => {
    record[header] = (cells[index] ?? "").replace(/"/g, "").trim();
  });
  return record;
}

function pick(record: Record<string, string>, keys: string[]): string {
  for (const key of keys) {
    if (record[key]) {
      return record[key];
    }
  }
  return "";
}

function rowToTransaction(
  record: Record<string, string>,
  rowKey: string
): ParsedCsvRow | null {
  const narration = pick(record, NARRATION_HEADERS);
  const dateRaw = pick(record, DATE_HEADERS);
  if (!narration || !dateRaw) {
    return null;
  }

  const bookedAt = parseIndianDate(dateRaw);
  if (!bookedAt) {
    return null;
  }

  const debit = parseAmount(pick(record, DEBIT_HEADERS));
  const credit = parseAmount(pick(record, CREDIT_HEADERS));
  const singleAmount = parseAmount(pick(record, AMOUNT_HEADERS));
  const typeRaw = pick(record, TYPE_HEADERS).toUpperCase();

  let direction: TransactionDirection;
  let amount: number;

  if (debit > 0) {
    direction = TransactionDirection.DEBIT;
    amount = debit;
  } else if (credit > 0) {
    direction = TransactionDirection.CREDIT;
    amount = credit;
  } else if (singleAmount > 0) {
    amount = singleAmount;
    if (typeRaw.includes("CR") || typeRaw === "CREDIT") {
      direction = TransactionDirection.CREDIT;
    } else {
      direction = TransactionDirection.DEBIT;
    }
  } else {
    return null;
  }

  const externalId = createHash("sha256")
    .update(`${rowKey}|${dateRaw}|${amount}|${narration}`)
    .digest("hex")
    .slice(0, 32);

  return {
    amount: amount.toFixed(2),
    bookedAt,
    direction,
    externalId,
    narration,
  };
}

function parseAmount(value: string): number {
  if (!value) {
    return 0;
  }
  const cleaned = value.replace(/[₹,\s]/g, "");
  const amount = Number.parseFloat(cleaned);
  return Number.isFinite(amount) ? Math.abs(amount) : 0;
}

/** Supports DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD. */
function parseIndianDate(value: string): Date | null {
  const trimmed = value.trim();
  const iso = new Date(trimmed);
  if (
    !Number.isNaN(iso.getTime()) &&
    trimmed.includes("-") &&
    trimmed.length >= 10
  ) {
    return iso;
  }

  const parts = trimmed.split(/[/-]/);
  if (parts.length !== 3) {
    return null;
  }

  const [a, b, c] = parts.map((p) => Number.parseInt(p, 10));
  if (parts[0].length === 4) {
    return new Date(a, b - 1, c);
  }
  return new Date(c, b - 1, a);
}
