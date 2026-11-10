import type { CreateTransactionRequest, Transaction } from '@shared-types';

const STORAGE_KEY = 'rupeelens-offline-queue';

export type OfflineQueuedCreate = {
  localId: string;
  userId: string;
  payload: CreateTransactionRequest;
};

function readQueue(): OfflineQueuedCreate[] {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as OfflineQueuedCreate[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(entries: OfflineQueuedCreate[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function isLocalTransactionId(id: string): boolean {
  return id.startsWith('local-');
}

export function queuedToTransaction(entry: OfflineQueuedCreate): Transaction {
  const p = entry.payload;
  return {
    amount: p.amount,
    bookedAt: p.bookedAt ?? new Date().toISOString(),
    category: p.category ?? null,
    id: entry.localId,
    notes: p.notes ?? null,
    status: p.status,
    title: p.title,
    transcript: p.transcript ?? null,
  };
}

export function listQueuedForUser(userId: string): Transaction[] {
  return readQueue()
    .filter((q) => q.userId === userId)
    .map(queuedToTransaction)
    .sort((a, b) => Date.parse(b.bookedAt) - Date.parse(a.bookedAt));
}

export function queueCreate(
  userId: string,
  payload: CreateTransactionRequest
): Transaction {
  const localId = `local-${crypto.randomUUID()}`;
  const entry: OfflineQueuedCreate = { localId, payload, userId };
  writeQueue([...readQueue(), entry]);
  return queuedToTransaction(entry);
}

export function removeQueued(localId: string): void {
  writeQueue(readQueue().filter((q) => q.localId !== localId));
}

export function updateQueued(
  localId: string,
  patch: Partial<CreateTransactionRequest>
): Transaction | null {
  let updated: OfflineQueuedCreate | null = null;
  const next = readQueue().map((q) => {
    if (q.localId !== localId) {
      return q;
    }
    updated = { ...q, payload: { ...q.payload, ...patch } };
    return updated;
  });
  if (!updated) {
    return null;
  }
  writeQueue(next);
  return queuedToTransaction(updated);
}

export function readQueuedCreate(localId: string): OfflineQueuedCreate | null {
  return readQueue().find((q) => q.localId === localId) ?? null;
}

export async function flushQueuedCreates(
  userId: string,
  create: (payload: CreateTransactionRequest) => Promise<Transaction>
): Promise<number> {
  const mine = readQueue().filter((q) => q.userId === userId);
  let synced = 0;
  for (const entry of mine) {
    await create(entry.payload);
    removeQueued(entry.localId);
    synced += 1;
  }
  return synced;
}
