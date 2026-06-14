export type CsvImportRequestDto = {
  csv: string;
  bankName: string;
  maskedAccountNumber?: string;
};

export type CsvImportResponseDto = {
  accountId: string;
  imported: number;
  skipped: number;
};

export type EmailParseRequestDto = {
  from: string;
  subject: string;
  body: string;
  messageId?: string;
  receivedAt?: string;
};

export type EmailImportResponseDto = {
  accountId: string;
  imported: number;
  skipped: number;
};

export type EmailSyncResponseDto = EmailImportResponseDto & {
  lastSyncAt: string;
  matched: number;
};

export type EmailSyncStatusDto = {
  lastEmailSyncAt: string | null;
  imapConfigured: boolean;
};

export type SmsImportRequestDto = {
  body: string;
  sender?: string;
  receivedAt?: string;
};

export type SmsImportResponseDto = {
  accountId: string;
  imported: number;
  skipped: number;
};

export type ImportKeyDto = {
  importKey: string;
};
