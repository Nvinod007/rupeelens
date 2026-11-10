import { registerAs } from '@nestjs/config';
import { parseCsv } from '@shared-utils';

import {
  DEFAULT_AI_DAILY_LIMIT,
  DEFAULT_BYOK_FILE_PATH,
  DEFAULT_CORS_ORIGINS,
  DEFAULT_PORT,
  GEMINI_DEFAULTS,
  type NodeEnvironment,
  type TransactionsStorageMode,
} from './config.constants';

const env = () => process.env;

export const appConfig = registerAs('app', () => {
  const nodeEnv = (env()['NODE_ENV'] ?? 'development') as NodeEnvironment;
  return {
    corsOrigins: [
      ...new Set([...DEFAULT_CORS_ORIGINS, ...parseCsv(env()['CORS_ORIGINS'])]),
    ],
    isProduction: nodeEnv === 'production',
    nodeEnv,
    port: Number(env()['PORT'] ?? DEFAULT_PORT),
  };
});

export const aiQuotaConfig = registerAs('aiQuota', () => ({
  dailyLimit: Number(env()['AI_DAILY_LIMIT'] ?? DEFAULT_AI_DAILY_LIMIT),
}));

export const geminiConfig = registerAs('gemini', () => ({
  baseUrl: (env()['GEMINI_API_BASE_URL'] ?? GEMINI_DEFAULTS.baseUrl).replace(/\/$/, ''),
  model: (env()['GEMINI_MODEL'] ?? GEMINI_DEFAULTS.model).replace(/^models\//, ''),
  temperature: Number(env()['GEMINI_TEMPERATURE'] ?? GEMINI_DEFAULTS.temperature),
  timeoutMs: Number(env()['GEMINI_REQUEST_TIMEOUT_MS'] ?? GEMINI_DEFAULTS.timeoutMs),
}));

export const supabaseConfig = registerAs('supabase', () => {
  const url = env()['SUPABASE_URL'];
  const serviceRoleKey = env()['SUPABASE_SERVICE_ROLE_KEY'];
  return {
    enabled: Boolean(url && serviceRoleKey),
    serviceRoleKey,
    url,
  };
});

export const securityConfig = registerAs('security', () => ({
  keyEncryptionSecret: env()['KEY_ENCRYPTION_SECRET'] as string,
}));

export const storageConfig = registerAs('storage', () => ({
  byokFilePath: DEFAULT_BYOK_FILE_PATH,
  transactions: (env()['TRANSACTIONS_STORAGE'] ?? 'auto') as TransactionsStorageMode,
}));

export const configLoaders = [
  aiQuotaConfig,
  appConfig,
  geminiConfig,
  securityConfig,
  storageConfig,
  supabaseConfig,
];
