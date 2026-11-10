'use client';

import type { AddExpenseTab } from '@/components/add/AddExpenseSheet';
import { sseParseDraft } from '@/lib/api/sseParseDraft';
import { useAuth } from '@/lib/auth/AuthProvider';
import { useOfflineSync } from '@/lib/hooks/useOfflineSync';
import { useSaveWithOffline } from '@/lib/hooks/useSaveWithOffline';
import {
  isLocalTransactionId,
  removeQueued,
  updateQueued,
} from '@/lib/offline-queue';
import { usePersistCustomCategory } from '@/lib/queries/categories';
import {
  transactionsKey,
  useDeleteTransaction,
  useUpdateTransaction,
} from '@/lib/queries/transactions';
import { useMicPermission } from '@/lib/speech/useMicPermission';
import { useWebSpeech } from '@/lib/speech/useWebSpeech';
import { DEFAULT_CATEGORY, type DraftTransaction, type Transaction } from '@shared-types';
import { buildHeuristicDraft } from '@shared-utils';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { emptyDraft } from './empty-draft';

/** Mic / add sheet / draft editor orchestration for the home page. */
export function useHomeExpenseFlow() {
  const speech = useWebSpeech();
  const { micBlocked: permBlocked } = useMicPermission();
  const micBlocked = permBlocked || speech.error === 'not-allowed';

  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { saveCreate, createMutation } = useSaveWithOffline();
  useOfflineSync();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const persistCustomCategory = usePersistCustomCategory();

  const [addOpen, setAddOpen] = useState(false);
  const [addInitialTab, setAddInitialTab] = useState<AddExpenseTab>('voice');
  const [helpOpen, setHelpOpen] = useState(false);
  const [parseBusy, setParseBusy] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draft, setDraft] = useState<DraftTransaction>(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingTranscript, setPendingTranscript] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [editingSaved, setEditingSaved] = useState(false);
  const [refineBusy, setRefineBusy] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);
  const [draftWriteBusy, setDraftWriteBusy] = useState(false);
  const [draftWriteError, setDraftWriteError] = useState<string | null>(null);
  const [addSession, setAddSession] = useState(0);
  const [writeBusy, setWriteBusy] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  useEffect(() => {
    if (dictating && speech.transcript) {
      setPendingTranscript(speech.transcript);
    }
  }, [dictating, speech.transcript]);

  const stopDictation = useCallback(() => {
    speech.stop();
    setDictating(false);
  }, [speech]);

  const closeAdd = useCallback(() => {
    speech.reset();
    setAddOpen(false);
    setParseBusy(false);
    setParseError(null);
    setWriteBusy(false);
    createMutation.reset();
  }, [createMutation, speech]);

  const openAdd = useCallback((tab: AddExpenseTab) => {
    setAddInitialTab(tab);
    setManualError(null);
    setAddSession((n) => n + 1);
    setAddOpen(true);
  }, []);

  const onFabPress = useCallback(() => {
    if (micBlocked) {
      setHelpOpen(true);
      return;
    }
    openAdd('voice');
  }, [micBlocked, openAdd]);

  const refineManually = useCallback(
    (transcript: string) => {
      setDraft(buildHeuristicDraft(transcript));
      setEditingId(null);
      setEditingSaved(false);
      setPendingTranscript(transcript);
      closeAdd();
      setDraftOpen(true);
    },
    [closeAdd]
  );

  const chooseSave = useCallback(
    async (transcript: string) => {
      if (!transcript) {
        return;
      }
      setParseBusy(true);
      setParseError(null);
      setPendingTranscript(transcript);
      try {
        setDraft(await sseParseDraft(transcript));
        setEditingId(null);
        setEditingSaved(false);
        closeAdd();
        setDraftOpen(true);
      } catch (error) {
        setParseError(
          error instanceof Error ? error.message : 'Could not parse with AI'
        );
      } finally {
        setParseBusy(false);
      }
    },
    [closeAdd]
  );

  const chooseDraft = useCallback(
    async (transcript: string) => {
      if (!transcript) {
        return;
      }
      setWriteBusy(true);
      setParseError(null);
      try {
        await saveCreate({
          amount: 0,
          notes: transcript,
          status: 'draft',
          title: transcript.slice(0, 48) || 'Draft',
          transcript,
        });
        closeAdd();
      } catch (error) {
        setParseError(
          error instanceof Error ? error.message : 'Could not save draft'
        );
      } finally {
        setWriteBusy(false);
      }
    },
    [closeAdd, saveCreate]
  );

  const manualSave = useCallback(
    async (fields: DraftTransaction) => {
      setManualError(null);
      setWriteBusy(true);
      try {
        const { result } = await saveCreate({
          amount: fields.amount,
          bookedAt: fields.bookedAt,
          category: fields.category,
          notes: fields.notes,
          status: 'saved',
          title: fields.title.trim(),
        });
        if (result === 'synced') {
          persistCustomCategory(fields.category);
        }
        closeAdd();
      } catch (error) {
        setManualError(
          error instanceof Error ? error.message : 'Could not save expense'
        );
      } finally {
        setWriteBusy(false);
      }
    },
    [closeAdd, persistCustomCategory, saveCreate]
  );

  const manualDraft = useCallback(
    async (fields: DraftTransaction) => {
      setManualError(null);
      setWriteBusy(true);
      try {
        const { result } = await saveCreate({
          amount: fields.amount,
          bookedAt: fields.bookedAt,
          category: fields.category,
          notes: fields.notes,
          status: 'draft',
          title: fields.title.trim() || 'Draft',
        });
        if (result === 'synced') {
          persistCustomCategory(fields.category);
        }
        closeAdd();
      } catch (error) {
        setManualError(
          error instanceof Error ? error.message : 'Could not save draft'
        );
      } finally {
        setWriteBusy(false);
      }
    },
    [closeAdd, persistCustomCategory, saveCreate]
  );

  const refineWithAi = useCallback(async () => {
    const text = (pendingTranscript || draft.notes || draft.title).trim();
    if (!text) {
      return;
    }
    setRefineBusy(true);
    setRefineError(null);
    try {
      setDraft(await sseParseDraft(text));
    } catch (error) {
      setRefineError(error instanceof Error ? error.message : 'AI failed');
    } finally {
      setRefineBusy(false);
    }
  }, [draft.notes, draft.title, pendingTranscript]);

  const confirmSaved = useCallback(async () => {
    setDraftWriteError(null);
    setDraftWriteBusy(true);
    const payload = {
      amount: draft.amount,
      bookedAt: draft.bookedAt,
      category: draft.category,
      notes: draft.notes,
      status: 'saved' as const,
      title: draft.title,
      transcript: pendingTranscript || undefined,
    };
    try {
      if (editingId && isLocalTransactionId(editingId)) {
        const updated = updateQueued(editingId, payload);
        if (updated && user) {
          queryClient.setQueryData<Transaction[]>(
            transactionsKey(user.id),
            (current = []) =>
              current.map((t) => (t.id === editingId ? updated : t))
          );
        }
        setDraftOpen(false);
        setEditingId(null);
        setPendingTranscript('');
        return;
      }
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload });
        persistCustomCategory(draft.category);
      } else {
        const { result } = await saveCreate(payload);
        if (result === 'synced') {
          persistCustomCategory(draft.category);
        }
      }
      setDraftOpen(false);
      setEditingId(null);
      setPendingTranscript('');
    } catch (error) {
      setDraftWriteError(
        error instanceof Error ? error.message : 'Could not save'
      );
    } finally {
      setDraftWriteBusy(false);
    }
  }, [
    draft,
    editingId,
    pendingTranscript,
    persistCustomCategory,
    queryClient,
    saveCreate,
    updateMutation,
    user,
  ]);

  const deleteEditing = useCallback(async () => {
    if (!editingId) {
      return;
    }
    setDraftWriteBusy(true);
    try {
      if (isLocalTransactionId(editingId) && user) {
        removeQueued(editingId);
        queryClient.setQueryData<Transaction[]>(
          transactionsKey(user.id),
          (current = []) => current.filter((t) => t.id !== editingId)
        );
      } else {
        await deleteMutation.mutateAsync(editingId);
      }
      stopDictation();
      setDraftOpen(false);
      setEditingId(null);
      setPendingTranscript('');
    } catch (error) {
      setDraftWriteError(
        error instanceof Error ? error.message : 'Could not delete'
      );
    } finally {
      setDraftWriteBusy(false);
    }
  }, [deleteMutation, editingId, queryClient, stopDictation, user]);

  const openDraftEdit = useCallback((tx: Transaction) => {
    setEditingId(tx.id);
    setEditingSaved(tx.status === 'saved');
    setRefineError(null);
    setDraftWriteError(null);
    setPendingTranscript(tx.transcript ?? tx.notes ?? '');
    setDraft({
      amount: tx.amount,
      bookedAt: tx.bookedAt,
      category: tx.category ?? DEFAULT_CATEGORY,
      notes: tx.notes ?? '',
      title: tx.title,
    });
    setDraftOpen(true);
  }, []);

  const discardDraft = useCallback(() => {
    stopDictation();
    setRefineError(null);
    setDraftWriteError(null);
    setDraftOpen(false);
    setEditingId(null);
    setPendingTranscript('');
  }, [stopDictation]);

  const toggleDictation = useCallback(() => {
    if (dictating) {
      stopDictation();
      return;
    }
    speech.reset();
    setDictating(true);
    speech.start();
  }, [dictating, speech, stopDictation]);

  return {
    add: {
      addInitialTab,
      addOpen,
      addSession,
      closeAdd,
      manualError,
      onChooseDraft: chooseDraft,
      onChooseSave: chooseSave,
      onManualDraft: manualDraft,
      onManualSave: manualSave,
      onRefineManually: refineManually,
      openAdd,
      parseBusy,
      parseError,
      writeBusy,
    },
    draft: {
      confirmSaved,
      deleteEditing,
      dictating,
      discardDraft,
      draft,
      draftOpen,
      draftWriteBusy,
      draftWriteError,
      deleting: deleteMutation.isPending,
      editingId,
      editingSaved,
      onChange: setDraft,
      onNoteChange: setPendingTranscript,
      openDraftEdit,
      pendingTranscript,
      refineError,
      refineWithAi,
      refineBusy,
      saving:
        draftWriteBusy ||
        deleteMutation.isPending ||
        updateMutation.isPending,
      stopDictation,
      toggleDictation,
    },
    help: { helpOpen, setHelpOpen },
    mic: { micBlocked, onFabPress },
    speech,
  };
}

export type HomeExpenseFlow = ReturnType<typeof useHomeExpenseFlow>;
