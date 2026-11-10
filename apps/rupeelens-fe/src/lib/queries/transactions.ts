'use client';

import type {
  CreateTransactionRequest,
  ListTransactionsParams,
  Transaction,
  UpdateTransactionRequest,
} from '@shared-types';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createTransaction,
  deleteTransaction,
  fetchTransactionPage,
  fetchTransactions,
  updateTransaction,
} from '../api';
import { useAuth } from '../auth/AuthProvider';

export const transactionsKey = (userId: string | undefined) =>
  ['transactions', userId] as const;

export const transactionListKey = (
  userId: string | undefined,
  filters: ListTransactionsParams
) => ['transactions', 'list', userId, filters] as const;

export function useTransactions() {
  const { user } = useAuth();
  return useQuery({
    enabled: Boolean(user),
    queryFn: ({ signal }) => fetchTransactions(signal),
    queryKey: transactionsKey(user?.id),
    retry: false,
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
      void queryClient.invalidateQueries({ queryKey: ['transactions', 'list'] });
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
      void queryClient.invalidateQueries({ queryKey: ['transactions', 'list'] });
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
      void queryClient.invalidateQueries({ queryKey: ['transactions', 'list'] });
    },
  });
}

export function useTransactionList(filters: ListTransactionsParams) {
  const { user } = useAuth();

  return useInfiniteQuery({
    enabled: Boolean(user),
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam, signal }) =>
      fetchTransactionPage(
        { ...filters, cursor: pageParam, limit: filters.limit ?? 50 },
        signal
      ),
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    // Keep showing the previous results while a new search/filter loads.
    placeholderData: keepPreviousData,
    queryKey: transactionListKey(user?.id, filters),
    retry: false,
  });
}
