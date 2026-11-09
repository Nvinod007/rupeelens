import {
  API_GLOBAL_PREFIX,
  API_ROUTES,
  AUTH_SCHEME,
  type ByokStatus,
  type CreateTransactionRequest,
  type SaveByokRequest,
  type Transaction,
  type UpdateTransactionRequest,
} from '@shared-types';

import { getAccessToken } from './auth/AuthProvider';
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
  const res = await fetch(apiUrl(route), {
    ...init,
    headers: { ...(await apiHeaders()), ...init?.headers },
  });
  if (res.status === 401) {
    await handleUnauthorized();
  }
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  return res.json() as Promise<T>;
}

const json = (method: string, body: unknown): RequestInit => ({
  body: JSON.stringify(body),
  method,
});

export const fetchTransactions = () =>
  apiFetch<Transaction[]>(API_ROUTES.transactions);

export const createTransaction = (payload: CreateTransactionRequest) =>
  apiFetch<Transaction>(API_ROUTES.transactions, json('POST', payload));

export const updateTransaction = (id: string, payload: UpdateTransactionRequest) =>
  apiFetch<Transaction>(`${API_ROUTES.transactions}/${id}`, json('PATCH', payload));

export const fetchByokStatus = () => apiFetch<ByokStatus>(API_ROUTES.settingsByokStatus);

export const saveByokKey = (payload: SaveByokRequest) =>
  apiFetch<ByokStatus>(API_ROUTES.settingsByok, json('POST', payload));

export const revokeByokKey = () =>
  apiFetch<ByokStatus>(API_ROUTES.settingsByok, { method: 'DELETE' });
