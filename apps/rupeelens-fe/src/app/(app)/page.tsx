'use client';

import { useEffect, useState } from 'react';

import {
  AddExpenseSheet,
  type AddExpenseTab,
} from '@/components/add/AddExpenseSheet';
import { MicSettingsHelpSheet } from '@/components/add/MicSettingsHelpSheet';
import { MicFab } from '@/components/app-shell/MicFab';
import { DraftEditSheet } from '@/components/draft/DraftEditSheet';
import { HomeSummary } from '@/components/home/HomeSummary';
import { TransactionRow } from '@/components/home/TransactionRow';
import {
  SummarySkeleton,
  TransactionsSkeleton,
} from '@/components/home/TransactionsSkeleton';
import { TransactionsEmptyState } from '@/components/home/TransactionsEmptyState';
import { sseParseDraft } from '@/lib/api/sseParseDraft';
import {
  useCreateTransaction,
  useDeleteTransaction,
  useTransactions,
  useUpdateTransaction,
} from '@/lib/queries/transactions';
import { useMicPermission } from '@/lib/speech/useMicPermission';
import { useWebSpeech } from '@/lib/speech/useWebSpeech';
import { DEFAULT_CATEGORY, type DraftTransaction, type Transaction } from '@shared-types';
import { buildHeuristicDraft } from '@shared-utils';

const emptyDraft = (): DraftTransaction => ({
  amount: 0,
  bookedAt: new Date().toISOString(),
  category: DEFAULT_CATEGORY,
  notes: '',
  title: 'Expense',
});

export default function HomePage() {
  const speech = useWebSpeech();
  const { micBlocked: permBlocked } = useMicPermission();
  const micBlocked = permBlocked || speech.error === 'not-allowed';

  const { data: transactions = [], isLoading: loading } = useTransactions();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();
  const deleteMutation = useDeleteTransaction();
  const [addOpen, setAddOpen] = useState(false);
  const [addInitialTab, setAddInitialTab] = useState<AddExpenseTab>('voice');
  const [helpOpen, setHelpOpen] = useState(false);
  const [parseBusy, setParseBusy] = useState(false);
  const [draftOpen, setDraftOpen] = useState(false);
  const [draft, setDraft] = useState<DraftTransaction>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingTranscript, setPendingTranscript] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [editingSaved, setEditingSaved] = useState(false);
  const [refineBusy, setRefineBusy] = useState(false);
  const [dictating, setDictating] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  // While re-recording inside the edit sheet, mirror live speech into the note.
  useEffect(() => {
    if (dictating && speech.transcript) {
      setPendingTranscript(speech.transcript);
    }
  }, [dictating, speech.transcript]);

  const stopDictation = () => {
    speech.stop();
    setDictating(false);
  };

  const toggleDictation = () => {
    if (dictating) {
      stopDictation();
      return;
    }
    speech.reset();
    setDictating(true);
    speech.start();
  };

  const refineWithAi = async () => {
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
  };

  const closeAdd = () => {
    speech.reset();
    setAddOpen(false);
    setParseBusy(false);
    setParseError(null);
  };

  const refineManually = (transcript: string) => {
    setDraft(buildHeuristicDraft(transcript));
    setEditingId(null);
    setEditingSaved(false);
    setPendingTranscript(transcript);
    closeAdd();
    setDraftOpen(true);
  };

  const openAdd = (tab: AddExpenseTab) => {
    setAddInitialTab(tab);
    setAddOpen(true);
  };

  const onFabPress = () => {
    if (micBlocked) {
      setHelpOpen(true);
      return;
    }
    openAdd('voice');
  };

  const chooseSave = async (transcript: string) => {
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
      setParseBusy(false);
      setParseError(
        error instanceof Error ? error.message : 'Could not parse with AI'
      );
    }
  };

  const chooseDraft = async (transcript: string) => {
    if (!transcript) {
      return;
    }
    try {
      await createMutation.mutateAsync({
        amount: 0,
        notes: transcript,
        status: 'draft',
        title: transcript.slice(0, 48) || 'Draft',
        transcript,
      });
      closeAdd();
    } catch {
      closeAdd();
    }
  };

  const manualSave = async (fields: DraftTransaction) => {
    try {
      await createMutation.mutateAsync({
        amount: fields.amount,
        bookedAt: fields.bookedAt,
        category: fields.category,
        notes: fields.notes,
        status: 'saved',
        title: fields.title.trim(),
      });
      closeAdd();
    } catch {
      /* keep sheet */
    }
  };

  const manualDraft = async (fields: DraftTransaction) => {
    try {
      await createMutation.mutateAsync({
        amount: fields.amount,
        bookedAt: fields.bookedAt,
        category: fields.category,
        notes: fields.notes,
        status: 'draft',
        title: fields.title.trim() || 'Draft',
      });
      closeAdd();
    } catch {
      /* keep sheet */
    }
  };

  const confirmSaved = async () => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          payload: {
            amount: draft.amount,
            bookedAt: draft.bookedAt,
            category: draft.category,
            notes: draft.notes,
            status: 'saved',
            title: draft.title,
            transcript: pendingTranscript || undefined,
          },
        });
      } else {
        await createMutation.mutateAsync({
          amount: draft.amount,
          bookedAt: draft.bookedAt,
          category: draft.category,
          notes: draft.notes,
          status: 'saved',
          title: draft.title,
          transcript: pendingTranscript || undefined,
        });
        }
      setDraftOpen(false);
      setEditingId(null);
      setPendingTranscript('');
    } catch {
      /* keep sheet open */
    }
  };

  const deleteEditing = async () => {
    if (!editingId) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(editingId);
      stopDictation();
      setDraftOpen(false);
      setEditingId(null);
      setPendingTranscript('');
    } catch {
      /* keep sheet open */
    }
  };

  const openDraftEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditingSaved(tx.status === 'saved');
    setRefineError(null);
    setPendingTranscript(tx.transcript ?? tx.notes ?? '');
    setDraft({
      amount: tx.amount,
      bookedAt: tx.bookedAt,
      category: tx.category ?? DEFAULT_CATEGORY,
      notes: tx.notes ?? '',
      title: tx.title,
    });
    setDraftOpen(true);
  };

  return (
    <>
      <HomeIntro micBlocked={micBlocked} onAdd={() => openAdd('prompt')} />
      {loading ? <SummarySkeleton /> : null}
      {transactions.length > 0 ? (
        <HomeSummary transactions={transactions} />
      ) : null}
      <section aria-label="Recent transactions" className="space-y-4">
        <h2 className="text-base font-semibold md:text-lg">Recent activity</h2>
        {loading ? (
          <TransactionsSkeleton />
        ) : transactions.length === 0 ? (
          <TransactionsEmptyState onAdd={onFabPress} />
        ) : (
          <ul className="grid gap-3 md:grid-cols-1 lg:grid-cols-2">
            {transactions.map((tx) => (
              <TransactionRow
                key={tx.id}
                onSelect={() => openDraftEdit(tx)}
                transaction={tx}
              />
            ))}
          </ul>
        )}
      </section>

      <MicFab micBlocked={micBlocked} onPress={onFabPress} />

      <MicSettingsHelpSheet
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        onUseManual={() => {
          setHelpOpen(false);
          openAdd('manual');
        }}
        onUsePrompt={() => {
          setHelpOpen(false);
          openAdd('prompt');
        }}
      />

      <AddExpenseSheet
        initialTab={addInitialTab}
        micBlocked={micBlocked}
        open={addOpen}
        onChooseDraft={(t) => void chooseDraft(t)}
        onChooseSave={(t) => void chooseSave(t)}
        onClose={closeAdd}
        onManualDraft={(d) => void manualDraft(d)}
        onManualSave={(d) => void manualSave(d)}
        onSpeechReset={speech.reset}
        onSpeechStart={speech.start}
        onSpeechStop={speech.stop}
        onRefineManually={refineManually}
        parseBusy={parseBusy}
        writeBusy={createMutation.isPending}
        parseError={parseError}
        speechError={speech.error}
        speechListening={speech.listening}
        speechSupported={speech.supported}
        speechTranscript={speech.transcript}
      />

      <DraftEditSheet
        draft={draft}
        onChange={setDraft}
        onRefineAi={() => void refineWithAi()}
        refineError={refineError}
        refining={refineBusy}
        saving={createMutation.isPending || updateMutation.isPending}
        saved={editingSaved}
        deleting={deleteMutation.isPending}
        onDelete={editingId ? () => void deleteEditing() : undefined}
        onDiscard={() => {
          stopDictation();
          setRefineError(null);
          setDraftOpen(false);
          setEditingId(null);
          setPendingTranscript('');
        }}
        onSave={() => {
          stopDictation();
          void confirmSaved();
        }}
        open={draftOpen}
        note={pendingTranscript}
        onNoteChange={setPendingTranscript}
        dictating={dictating}
        onToggleDictation={
          speech.supported && !micBlocked ? toggleDictation : undefined
        }
      />
    </>
  );
}

function HomeIntro({
  micBlocked,
  onAdd,
}: {
  micBlocked: boolean;
  onAdd: () => void;
}) {
  return (
    <header className="mb-4 space-y-1 md:hidden">
      <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
      <p className="text-sm text-muted-foreground">
        Mic, prompt, or form → Save (AI + review), Draft, or Cancel.
      </p>
      {micBlocked ? (
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-secondary underline"
        >
          Mic blocked — type or use the form
        </button>
      ) : null}
    </header>
  );
}
