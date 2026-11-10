'use client';

import { DraftEditSheet } from '@/components/draft/DraftEditSheet';
import { usePersistCustomCategory } from '@/lib/queries/categories';
import {
  useDeleteTransaction,
  useUpdateTransaction,
} from '@/lib/queries/transactions';
import {
  DEFAULT_CATEGORY,
  type DraftTransaction,
  type Transaction,
} from '@shared-types';
import { useCallback, useState } from 'react';

import { emptyDraft } from '@/app/(app)/home/empty-draft';

const toDraft = (tx: Transaction): DraftTransaction => ({
  amount: tx.amount,
  bookedAt: tx.bookedAt,
  category: tx.category ?? DEFAULT_CATEGORY,
  notes: tx.notes ?? '',
  title: tx.title,
});

/** Open saved/draft rows in {@link DraftEditSheet} from list pages. */
export function useTransactionEditor() {
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const persistCustomCategory = usePersistCustomCategory();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSaved, setEditingSaved] = useState(false);
  const [draft, setDraft] = useState<DraftTransaction>(emptyDraft);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const openTransaction = useCallback((tx: Transaction) => {
    setEditingId(tx.id);
    setEditingSaved(tx.status === 'saved');
    setDraft(toDraft(tx));
    setNote(tx.transcript ?? tx.notes ?? '');
    setError(null);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setEditingId(null);
    setError(null);
  }, []);

  const save = useCallback(async () => {
    if (!editingId) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      persistCustomCategory(draft.category);
      await updateMutation.mutateAsync({
        id: editingId,
        payload: {
          amount: draft.amount,
          bookedAt: draft.bookedAt,
          category: draft.category || undefined,
          notes: draft.notes,
          status: 'saved',
          title: draft.title,
          transcript: note || undefined,
        },
      });
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  }, [close, draft, editingId, note, persistCustomCategory, updateMutation]);

  const remove = useCallback(async () => {
    if (!editingId) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await deleteMutation.mutateAsync(editingId);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete');
    } finally {
      setBusy(false);
    }
  }, [close, deleteMutation, editingId]);

  const sheet = (
    <DraftEditSheet
      draft={draft}
      note={note}
      onChange={setDraft}
      onDelete={editingSaved ? () => void remove() : undefined}
      onDiscard={close}
      onNoteChange={setNote}
      onSave={() => void save()}
      open={open}
      saved={editingSaved}
      saveError={error}
      saving={busy || updateMutation.isPending}
      deleting={deleteMutation.isPending}
    />
  );

  return { openTransaction, sheet };
}
