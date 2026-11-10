'use client';

import type { Transaction } from '@shared-types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

import { createTransaction } from '../api';
import { useAuth } from '../auth/AuthProvider';
import { flushQueuedCreates, listQueuedForUser } from '../offline-queue';
import { transactionsKey } from '../queries/transactions';

/** Syncs local queue when the browser is back online; merges queued rows into the list. */
export function useOfflineSync() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mergeQueuedIntoCache = useCallback(() => {
    if (!user) {
      return;
    }
    const queued = listQueuedForUser(user.id);
    queryClient.setQueryData<Transaction[]>(
      transactionsKey(user.id),
      (server = []) => {
        const serverIds = new Set(server.map((t) => t.id));
        const pending = queued.filter((q) => !serverIds.has(q.id));
        const merged = [...pending, ...server];
        merged.sort(
          (a, b) => Date.parse(b.bookedAt) - Date.parse(a.bookedAt)
        );
        return merged;
      }
    );
  }, [queryClient, user]);

  const sync = useCallback(async () => {
    if (!user || typeof navigator === 'undefined' || !navigator.onLine) {
      return;
    }
    const count = await flushQueuedCreates(user.id, createTransaction);
    if (count > 0) {
      await queryClient.invalidateQueries({
        queryKey: transactionsKey(user.id),
      });
    }
    mergeQueuedIntoCache();
  }, [mergeQueuedIntoCache, queryClient, user]);

  useEffect(() => {
    mergeQueuedIntoCache();
  }, [mergeQueuedIntoCache]);

  useEffect(() => {
    const onOnline = () => void sync();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [sync]);

  return { mergeQueuedIntoCache, syncNow: sync };
}
