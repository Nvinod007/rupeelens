export type SetuCreateConsentRequest = {
  consentDuration: { unit: string; value: string };
  consentMode: string;
  dataLife: { unit: string; value: string };
  dataRange: { from: string; to: string };
  fetchType: string;
  fiTypes: string[];
  purpose: { code: string; refUri: string; text: string };
  redirectUrl: string;
  vua: string;
};

export type SetuCreateConsentResponse = {
  id: string;
  status?: string;
  url: string;
};

export type SetuAuthTokenResponse = {
  access_token?: string;
  expiresIn?: number;
  expires_in?: number;
};

export type SetuFiTransaction = {
  amount: string;
  currentBalance?: string;
  mode?: string;
  narration: string;
  reference?: string;
  transactionTimestamp?: string;
  txnId: string;
  type: string;
  valueDate?: string;
};

export type SetuFiAccountData = {
  account?: {
    maskedAccNumber?: string;
    type?: string;
  };
  linkRefNumber?: string;
  maskedAccNumber?: string;
  Transactions?: {
    Transaction?: SetuFiTransaction[];
  };
  transactions?: SetuFiTransaction[];
};

export type SetuFetchFiResponse = {
  FI?: Array<{
    data?: SetuFiAccountData[];
    fipID?: string;
  }>;
  sessionId?: string;
  status?: string;
};
