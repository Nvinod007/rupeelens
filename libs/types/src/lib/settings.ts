export type ByokStatus = {
  configured: boolean;
};

/** AI parses used today (IST) versus the per-user daily limit. */
export type AiUsage = {
  used: number;
  limit: number;
};

export type SaveByokRequest = {
  apiKey: string;
  consentAccepted: boolean;
};
