export type SetuConfig = {
  authUrl: string;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  consentRedirectUrl: string;
  /** When true, Setu credentials are missing — use local mock consent + ingestion. */
  isMockMode: boolean;
  productInstanceId: string;
  webhookSecret: string;
};

function readEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

export function loadSetuConfig(): SetuConfig {
  const clientId = readEnv("SETU_AA_CLIENT_ID");
  const clientSecret = readEnv("SETU_AA_CLIENT_SECRET");
  const baseUrl = readEnv("SETU_AA_BASE_URL") || "https://fiu-sandbox.setu.co";
  const isMockMode = !clientId || !clientSecret;

  return {
    authUrl:
      readEnv("SETU_AA_AUTH_URL") || "https://uat.setu.co/api/v2/auth/token",
    baseUrl,
    clientId,
    clientSecret,
    consentRedirectUrl:
      readEnv("SETU_CONSENT_REDIRECT_URL") || "http://localhost:3000",
    isMockMode,
    productInstanceId: readEnv("SETU_AA_PRODUCT_INSTANCE_ID"),
    webhookSecret: readEnv("SETU_WEBHOOK_SECRET"),
  };
}
