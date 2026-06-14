export type AccountSource = "MANUAL" | "SETU";

export type AccountDto = {
  id: string;
  bankName: string;
  maskedAccountNumber: string;
  source: AccountSource;
  createdAt: string;
};
