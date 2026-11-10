import {
  API_GLOBAL_PREFIX,
  type AiUsage,
  API_ROUTES,
  AUTH_SCHEME,
  type ByokStatus,
  type CreateCategoryRequest,
  type CreateTransactionRequest,
  type ListTransactionsParams,
  type SaveByokRequest,
  type Transaction,
  type TransactionListPage,
  type UpdateTransactionRequest,
  type UserCategory,
} from '@shared-types';

import { getAccessToken } from './auth/AuthProvider';
import {
  API_REQUEST_TIMEOUT_MS,
  assertBrowserOnline,
  toUserNetworkError,
} from './network';
import { getSupabase } from './supabase/client';

const DEFAULT_API_URL = 'http://localhost:4001';

export const apiUrl = (route: string): string => {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? DEFAULT_API_URL;
  return `${base}/${API_GLOBAL_PREFIX}${route}`;
};

export async function apiHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `${AUTH_SCHEME} ${token}` } : {}),
  };
}

/** Expired/invalid session: clear it so the auth gate sends the user to /login. */
async function handleUnauthorized(): Promise<void> {
  await getSupabase().auth.signOut();
}

/** Turns a Nest error body (string | string[] message) into readable text. */
export async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const body = JSON.parse(text) as { message?: string | string[] };
    if (Array.isArray(body.message)) {
      return body.message.join('. ');
    }
    if (body.message) {
      return body.message;
    }
  } catch {
    // not JSON — fall through
  }
  return text || res.statusText;
}

async function apiFetch<T>(route: string, init?: RequestInit): Promise<T> {
  assertBrowserOnline();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    API_REQUEST_TIMEOUT_MS
  );
  // Honour caller cancellation (React Query) while keeping the timeout.
  const external = init?.signal;
  const onExternalAbort = () => controller.abort();
  if (external?.aborted) {
    controller.abort();
  } else {
    external?.addEventListener('abort', onExternalAbort, { once: true });
  }

  try {
    const res = await fetch(apiUrl(route), {
      ...init,
      headers: { ...(await apiHeaders()), ...init?.headers },
      signal: controller.signal,
    });
    if (res.status === 401) {
      await handleUnauthorized();
    }
    if (!res.ok) {
      throw new Error(await readErrorMessage(res));
    }
    if (res.status === 204) {
      return undefined as T;
    }
    return res.json() as Promise<T>;
  } catch (error) {
    throw toUserNetworkError(error);
  } finally {
    clearTimeout(timeout);
    external?.removeEventListener('abort', onExternalAbort);
  }
}

const json = (method: string, body: unknown): RequestInit => ({
  body: JSON.stringify(body),
  method,
});

const listTransactionsQuery = (params: ListTransactionsParams = {}) => {
  const qs = new URLSearchParams();
  if (params.limit !== undefined) {
    qs.set('limit', String(params.limit));
  }
  if (params.cursor) {
    qs.set('cursor', params.cursor);
  }
  if (params.q) {
    qs.set('q', params.q);
  }
  if (params.category) {
    qs.set('category', params.category);
  }
  if (params.status) {
    qs.set('status', params.status);
  }
  const suffix = qs.size ? `?${qs.toString()}` : '';
  return `${API_ROUTES.transactions}${suffix}`;
};

/** Supports paginated `{ items, nextCursor }` and legacy bare arrays. */
function normalizeTransactionListPage(body: unknown): TransactionListPage {
  if (Array.isArray(body)) {
    return { items: body, nextCursor: null };
  }
  if (
    body &&
    typeof body === 'object' &&
    Array.isArray((body as TransactionListPage).items)
  ) {
    const page = body as TransactionListPage;
    return {
      items: page.items,
      nextCursor: page.nextCursor ?? null,
    };
  }
  throw new Error('Unexpected transactions response from API');
}

export async function fetchTransactionPage(
  params: ListTransactionsParams = {},
  signal?: AbortSignal
): Promise<TransactionListPage> {
  const body = await apiFetch<unknown>(listTransactionsQuery(params), {
    signal,
  });
  return normalizeTransactionListPage(body);
}

/** Loads up to 500 newest rows (paged) for home cache and export. */
export async function fetchTransactions(
  signal?: AbortSignal
): Promise<Transaction[]> {
  const all: Transaction[] = [];
  let cursor: string | undefined;
  const pageSize = 100;
  const cap = 500;

  do {
    const page = await fetchTransactionPage(
      { cursor, limit: pageSize },
      signal
    );
    all.push(...page.items);
    cursor = page.nextCursor ?? undefined;
  } while (cursor && all.length < cap);

  return all;
}

export const createTransaction = (payload: CreateTransactionRequest) =>
  apiFetch<Transaction>(API_ROUTES.transactions, json('POST', payload));

export const updateTransaction = (id: string, payload: UpdateTransactionRequest) =>
  apiFetch<Transaction>(`${API_ROUTES.transactions}/${id}`, json('PATCH', payload));

export const deleteTransaction = (id: string) =>
  apiFetch<void>(`${API_ROUTES.transactions}/${id}`, { method: 'DELETE' });

export const fetchCategories = () =>
  apiFetch<UserCategory[]>(API_ROUTES.categories);

export const addCategory = (payload: CreateCategoryRequest) =>
  apiFetch<UserCategory[]>(API_ROUTES.categories, json('POST', payload));

export const deleteCategory = (id: string) =>
  apiFetch<void>(`${API_ROUTES.categories}/${id}`, { method: 'DELETE' });

export const fetchByokStatus = () => apiFetch<ByokStatus>(API_ROUTES.settingsByokStatus);

export const fetchAiUsage = () =>
  apiFetch<AiUsage>(API_ROUTES.settingsAiUsage);

export const saveByokKey = (payload: SaveByokRequest) =>
  apiFetch<ByokStatus>(API_ROUTES.settingsByok, json('POST', payload));

export const revokeByokKey = () =>
  apiFetch<ByokStatus>(API_ROUTES.settingsByok, { method: 'DELETE' });
