'use client';

import { EXPENSE_CATEGORIES, type UserCategory } from '@shared-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

import { addCategory, deleteCategory, fetchCategories } from '../api';
import { useAuth } from '../auth/AuthProvider';

export const categoriesKey = (userId: string | undefined) =>
  ['categories', userId] as const;

export function useCategories() {
  const { user } = useAuth();
  return useQuery({
    enabled: Boolean(user),
    queryFn: fetchCategories,
    queryKey: categoriesKey(user?.id),
    staleTime: 5 * 60_000,
  });
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (name: string) => addCategory({ name }),
    onSuccess: (list) => {
      queryClient.setQueryData<UserCategory[]>(categoriesKey(user?.id), list);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: (_result, id) => {
      queryClient.setQueryData<UserCategory[]>(
        categoriesKey(user?.id),
        (current = []) => current.filter((c) => c.id !== id)
      );
    },
  });
}

/** Built-in categories followed by the user's own (no duplicates). */
export function useCategoryOptions(): readonly string[] {
  const { data: custom = [] } = useCategories();
  return useMemo(() => {
    const seen = new Set(EXPENSE_CATEGORIES.map((c) => c.toLowerCase()));
    const extra = custom
      .map((c) => c.name)
      .filter((name) => !seen.has(name.toLowerCase()));
    return [...EXPENSE_CATEGORIES, ...extra];
  }, [custom]);
}
