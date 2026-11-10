import type { CreateTransactionRequest } from '@shared-types';

import {
  flushQueuedCreates,
  isLocalTransactionId,
  listQueuedForUser,
  queueCreate,
  removeQueued,
  updateQueued,
} from './offline-queue';

const payload: CreateTransactionRequest = {
  amount: 99,
  bookedAt: '2026-11-10T09:00:00.000Z',
  status: 'saved',
  title: 'Tea',
};

describe('offline queue', () => {
  beforeEach(() => {
    localStorage.clear();
    let seq = 0;
    Object.defineProperty(globalThis, 'crypto', {
      configurable: true,
      value: {
        randomUUID: () =>
          `00000000-0000-4000-8000-${String(++seq).padStart(12, '0')}`,
      },
    });
  });

  it('queues per user with local ids', () => {
    const tx = queueCreate('user-a', payload);
    expect(isLocalTransactionId(tx.id)).toBe(true);
    expect(listQueuedForUser('user-a')).toHaveLength(1);
    expect(listQueuedForUser('user-b')).toHaveLength(0);
    expect(tx.title).toBe('Tea');
  });

  it('updates and removes queued rows', () => {
    const tx = queueCreate('user-a', payload);
    const updated = updateQueued(tx.id, { title: 'Chai', amount: 40 });
    expect(updated?.title).toBe('Chai');
    expect(updated?.amount).toBe(40);
    removeQueued(tx.id);
    expect(listQueuedForUser('user-a')).toHaveLength(0);
  });

  it('flushes to API and clears storage', async () => {
    queueCreate('user-a', payload);
    queueCreate('user-a', { ...payload, title: 'Second' });
    const calls: CreateTransactionRequest[] = [];
    const synced = await flushQueuedCreates('user-a', async (p) => {
      calls.push(p);
      return { ...payload, id: 'server-id', category: null, notes: null, transcript: null };
    });
    expect(synced).toBe(2);
    expect(calls.map((c) => c.title)).toEqual(['Tea', 'Second']);
    expect(listQueuedForUser('user-a')).toHaveLength(0);
  });
});
