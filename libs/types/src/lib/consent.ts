/** Matches Prisma `ConsentStatus`. */
export type ConsentStatus = "PENDING" | "ACTIVE" | "REVOKED" | "EXPIRED";

export type CreateConsentDto = {
  purpose: string;
  fiTypes: string[];
  dateRange: { from: string; to: string };
};

export type ConsentResponseDto = {
  id: string;
  setuConsentId: string;
  status: ConsentStatus;
  redirectUrl: string | null;
  createdAt: string;
};

export type SetuWebhookPayload = {
  type: string;
  timestamp: string;
  consentId: string;
  dataSessionId?: string;
  data?: {
    status?: string;
    sessionId?: string;
  };
};

export type SetuWebhookResponse = {
  status: "received";
};
