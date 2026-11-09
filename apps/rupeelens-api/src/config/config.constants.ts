/** Per-user request budgets (fall back to IP when unauthenticated). */
export const RATE_LIMITS = {
  /** Applies to every route unless overridden. */
  default: { limit: 60, ttl: 60_000 },
  /** LLM calls cost money and quota, so they get a tight budget. */
  parse: { limit: 10, ttl: 60_000 },
} as const;

export const DEFAULT_PORT = 4001;

export const DEFAULT_CORS_ORIGINS: readonly string[] = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:4200',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4200',
  'https://rupeelens.appkits.in',
];

/** Non-production only: any localhost / loopback origin is accepted. */
export const LOCAL_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export const GEMINI_DEFAULTS = {
  baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
  model: 'gemini-3.5-flash-lite',
  temperature: 0.2,
  timeoutMs: 20_000,
} as const;

export const TRANSACTIONS_STORAGE_MODES = ['auto', 'memory', 'supabase'] as const;
export type TransactionsStorageMode = (typeof TRANSACTIONS_STORAGE_MODES)[number];

export const NODE_ENVIRONMENTS = ['development', 'test', 'production'] as const;
export type NodeEnvironment = (typeof NODE_ENVIRONMENTS)[number];

export const DEFAULT_BYOK_FILE_PATH = 'apps/rupeelens-api/.data/byok.json';
