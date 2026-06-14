export type EmailImapConfig = {
  enabled: boolean;
  host: string;
  password: string;
  port: number;
  senders: string[];
  user: string;
};

function readEnv(key: string): string {
  return process.env[key]?.trim() ?? "";
}

export function isEmailImapConfigured(): boolean {
  const config = loadEmailImapConfig();
  return config.enabled && Boolean(config.user && config.password);
}

export function loadEmailImapConfig(): EmailImapConfig {
  const flag = readEnv("EMAIL_IMAP_ENABLED").toLowerCase();
  const sendersRaw = readEnv("EMAIL_IMAP_SENDERS");

  return {
    enabled: flag === "true" || flag === "1",
    host: readEnv("EMAIL_IMAP_HOST") || "imap.gmail.com",
    password: readEnv("EMAIL_IMAP_PASSWORD"),
    port: Number.parseInt(readEnv("EMAIL_IMAP_PORT") || "993", 10),
    senders: sendersRaw
      ? sendersRaw
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : [
          "alerts@hdfcbank.net",
          "no-reply@icicibank.com",
          "axisbank.com",
          "notifications@idfcbank.com",
        ],
    user: readEnv("EMAIL_IMAP_USER"),
  };
}
