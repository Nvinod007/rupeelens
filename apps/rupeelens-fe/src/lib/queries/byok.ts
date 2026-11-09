'use client';

import type { ByokStatus, SaveByokRequest } from '@shared-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { fetchByokStatus, revokeByokKey, saveByokKey } from '../api';
import { useAuth } from '../auth/AuthProvider';

export const byokStatusKey = (userId: string | undefined) =>
  ['byok-status', userId] as const;

export function useByokStatus() {
  const { user } = useAuth();
  return useQuery({
    enabled: Boolean(user),
    queryFn: fetchByokStatus,
    queryKey: byokStatusKey(user?.id),
  });
}

function useByokStatusSetter() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  return (status: ByokStatus) =>
    queryClient.setQueryData<ByokStatus>(byokStatusKey(user?.id), status);
}

export function useSaveByok() {
  const setStatus = useByokStatusSetter();
  return useMutation({
    mutationFn: (payload: SaveByokRequest) => saveByokKey(payload),
    onSuccess: () => setStatus({ configured: true }),
  });
}

export function useRevokeByok() {
  const setStatus = useByokStatusSetter();
  return useMutation({
    mutationFn: revokeByokKey,
    onSuccess: () => setStatus({ configured: false }),
  });
}
