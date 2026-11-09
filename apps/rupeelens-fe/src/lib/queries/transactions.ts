'use client';

import type {
  CreateTransactionRequest,
  Transaction,
  UpdateTransactionRequest,
} from '@shared-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
} from '../api';
import { useAuth } from '../auth/AuthProvider';

export const transactionsKey = (userId: string | undefined) =>
  ['transactions', userId] as const;

export function useTransactions() {
  const { user } = useAuth();
  return useQuery({
    enabled: Boolean(user),
    queryFn: fetchTransactions,
    queryKey: transactionsKey(user?.id),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (payload: CreateTransactionRequest) => createTransaction(payload),
    onSuccess: (created) => {
      queryClient.setQueryData<Transaction[]>(
        transactionsKey(user?.id),
        (current = []) => [created, ...current]
      );
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTransactionRequest }) =>
      updateTransaction(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Transaction[]>(
        transactionsKey(user?.id),
        (current = []) => current.map((t) => (t.id === updated.id ? updated : t))
      );
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Transaction[]>(
        transactionsKey(user?.id),
        (current = []) => current.filter((t) => t.id !== id)
      );
    },
  });
}
