/**
 * HTTP contract shared by the Next.js client and the Nest API.
 * Keep literal values here so both sides can never drift.
 */

export const API_GLOBAL_PREFIX = 'api';

/** Authentication: `Authorization: Bearer <Supabase access token>`. */
export const AUTH_HEADER = 'authorization';
export const AUTH_SCHEME = 'Bearer';

export const API_ROUTES = {
  categories: '/categories',
  health: '/health',
  parseDraft: '/parse/draft',
  settingsByok: '/settings/byok',
  settingsByokStatus: '/settings/byok/status',
  transactions: '/transactions',
} as const;

export const SSE_EVENTS = {
  complete: 'complete',
  error: 'error',
  status: 'status',
} as const;
