'use client';

import type { CreateTransactionRequest, Transaction } from '@shared-types';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useAuth } from '../auth/AuthProvider';
import { isBrowserOffline, isNetworkFailure } from '../network';
import { queueCreate } from '../offline-queue';
import { useCreateTransaction, transactionsKey } from '../queries/transactions';

type SaveResult = 'synced' | 'local';

export function useSaveWithOffline() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const createMutation = useCreateTransaction();

  const saveCreate = useCallback(
    async (
      payload: CreateTransactionRequest
    ): Promise<{ result: SaveResult }> => {
      if (!user) {
        throw new Error('Sign in to save expenses');
      }

      const cacheLocal = (tx: Transaction) => {
        queryClient.setQueryData<Transaction[]>(
          transactionsKey(user.id),
          (current = []) => [tx, ...current.filter((t) => t.id !== tx.id)]
        );
      };

      if (isBrowserOffline()) {
        cacheLocal(queueCreate(user.id, payload));
        return { result: 'local' };
      }

      try {
        await createMutation.mutateAsync(payload);
        return { result: 'synced' };
      } catch (error) {
        if (isNetworkFailure(error)) {
          cacheLocal(queueCreate(user.id, payload));
          return { result: 'local' };
        }
        throw error;
      }
    },
    [createMutation, queryClient, user]
  );

  return { saveCreate, createMutation };
}
