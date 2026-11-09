'use client';

import { useEffect, useState } from 'react';

import { NoteDispositionActions } from '@/components/voice/NoteDispositionActions';
import { Spinner } from '@shared-ui';

import { AiSettingsLink } from '@/components/common/AiSettingsLink';
import { DEFAULT_CATEGORY, type DraftTransaction } from '@shared-types';
import { fromDateTimeLocalValue, toDateTimeLocalValue } from '@shared-utils';

export type AddExpenseTab = 'voice' | 'prompt' | 'manual';

type CapturePhase = 'capture' | 'choose';

type AddExpenseSheetProps = {
  open: boolean;
  initialTab?: AddExpenseTab;
  micBlocked: boolean;
  speechSupported: boolean;
  speechListening: boolean;
  speechTranscript: string;
  speechError: string | null;
  onSpeechStart: () => void;
  onSpeechStop: () => void;
  onSpeechReset: () => void;
  /** AI structuring (Save) in flight. */
  parseBusy?: boolean;
  /** A transaction/draft write is in flight. */
  writeBusy?: boolean;
  parseError?: string | null;
  onRefineManually: (transcript: string) => void;
  onClose: () => void;
  onChooseSave: (transcript: string) => void;
  onChooseDraft: (transcript: string) => void;
  onManualSave: (draft: DraftTransaction) => void;
  onManualDraft: (draft: DraftTransaction) => void;
};

function emptyManual(): DraftTransaction {
  return {
    amount: 0,
    bookedAt: new Date().toISOString(),
    category: DEFAULT_CATEGORY,
    notes: '',
    title: '',
  };
}

export function AddExpenseSheet({
  open,
  initialTab = 'voice',
  micBlocked,
  speechSupported,
  speechListening,
  speechTranscript,
  speechError,
  onSpeechStart,
  onSpeechStop,
  onSpeechReset,
  parseBusy = false,
  writeBusy = false,
  parseError = null,
  onRefineManually,
  onClose,
  onChooseSave,
  onChooseDraft,
  onManualSave,
  onManualDraft,
}: AddExpenseSheetProps) {
  const [tab, setTab] = useState<AddExpenseTab>(initialTab);
  const [phase, setPhase] = useState<CapturePhase>('capture');
  const [noteText, setNoteText] = useState('');
  const [manual, setManual] = useState<DraftTransaction>(emptyManual);

  useEffect(() => {
    if (!open) {
      return;
    }
    setTab(initialTab);
    setPhase('capture');
    setNoteText('');
    setManual(emptyManual());
    onSpeechReset();
    if (initialTab === 'voice' && !micBlocked && speechSupported) {
      onSpeechStart();
    }
  }, [open, initialTab, micBlocked, speechSupported, onSpeechReset, onSpeechStart]);

  const changeTab = (next: AddExpenseTab) => {
    setPhase('capture');
    setTab(next);
    if (next === 'voice' && !micBlocked && speechSupported) {
      onSpeechStart();
    } else {
      onSpeechStop();
    }
  };

  if (!open) {
    return null;
  }

  const transcript =
    tab === 'voice' && phase === 'capture'
      ? speechTranscript.trim()
      : noteText.trim();

  const closeAll = () => {
    onSpeechReset();
    onClose();
  };

  const goChoose = () => {
    if (tab === 'voice') {
      onSpeechStop();
      setNoteText(speechTranscript.trim());
    }
    setPhase('choose');
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-expense-title"
    >
      <div className="glass-card w-full max-w-lg space-y-4 p-5 pb-6">
        <div className="flex items-start justify-between gap-3">
          <h2 id="add-expense-title" className="text-lg font-semibold">
            Add expense
          </h2>
          <button
            type="button"
            onClick={closeAll}
            className="text-sm text-muted-foreground"
          >
            Close
          </button>
        </div>

        <TabBar active={tab} micBlocked={micBlocked} onChange={changeTab} />

        {tab === 'voice' ? (
          <VoicePanel
            micBlocked={micBlocked}
            noteText={noteText}
            onNoteChange={setNoteText}
            phase={phase}
            listening={speechListening}
            supported={speechSupported}
            liveTranscript={speechTranscript}
            onCancel={closeAll}
            onStop={goChoose}
            onSwitchPrompt={() => changeTab('prompt')}
          />
        ) : null}

        {tab === 'prompt' ? (
          <PromptPanel
            phase={phase}
            text={noteText}
            onChange={setNoteText}
            onContinue={() => setPhase('choose')}
            onBack={() => setPhase('capture')}
            onCancel={closeAll}
          />
        ) : null}

        {tab === 'manual' ? (
          <ManualPanel
            draft={manual}
            onChange={setManual}
            busy={writeBusy}
            onCancel={closeAll}
            onSave={() => onManualSave(manual)}
            onSaveDraft={() => onManualDraft(manual)}
          />
        ) : null}

        {tab !== 'manual' && phase === 'choose' && parseError ? (
          <div
            role="alert"
            className="space-y-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm"
          >
            <p className="font-medium text-amber-100">
              AI couldn’t structure this right now
            </p>
            <p className="text-muted-foreground">
              Save it as a draft for now and refine later, or fill in the
              fields yourself.
            </p>
            <AiSettingsLink className="block text-sm" />
            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer">Details</summary>
              <p className="mt-1 break-words">{parseError}</p>
            </details>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => onChooseDraft(transcript)}
                className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Save as draft
              </button>
              <button
                type="button"
                onClick={() => onRefineManually(transcript)}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm"
              >
                Refine manually
              </button>
            </div>
          </div>
        ) : null}

        {tab !== 'manual' && phase === 'choose' ? (
          <NoteDispositionActions
            drafting={writeBusy}
            saving={parseBusy}
            onChooseCancel={() => {
              setPhase('capture');
              setNoteText('');
              onSpeechReset();
              if (tab === 'voice' && !micBlocked) {
                onSpeechStart();
              }
            }}
            onChooseDraft={() => onChooseDraft(transcript)}
            onChooseSave={() => onChooseSave(transcript)}
          />
        ) : null}

        {speechError === 'not-allowed' ? (
          <p className="text-sm text-destructive">
            Microphone blocked — allow access in browser settings or use Prompt /
            Form.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function TabBar({
  active,
  micBlocked,
  onChange,
}: {
  active: AddExpenseTab;
  micBlocked: boolean;
  onChange: (t: AddExpenseTab) => void;
}) {
  const tabs: { id: AddExpenseTab; label: string }[] = [
    { id: 'voice', label: micBlocked ? 'Mic off' : 'Mic' },
    { id: 'prompt', label: 'Prompt' },
    { id: 'manual', label: 'Form' },
  ];
  return (
    <div
      className="flex gap-1 rounded-lg border border-border bg-muted/30 p-1"
      role="tablist"
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={active === t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition sm:text-sm ${
            active === t.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground'
          } ${t.id === 'voice' && micBlocked ? 'text-destructive' : ''}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function VoicePanel({
  micBlocked,
  phase,
  listening,
  supported,
  liveTranscript,
  noteText,
  onNoteChange,
  onStop,
  onCancel,
  onSwitchPrompt,
}: {
  micBlocked: boolean;
  phase: CapturePhase;
  listening: boolean;
  supported: boolean;
  liveTranscript: string;
  noteText: string;
  onNoteChange: (value: string) => void;
  onStop: () => void;
  onCancel: () => void;
  onSwitchPrompt: () => void;
}) {
  if (phase !== 'capture') {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Note ready</p>
        <p className="text-xs text-muted-foreground">
          Fix anything the mic got wrong before Save or Draft.
        </p>
        <textarea
          className="field-input min-h-28 font-mono text-sm"
          value={noteText}
          onChange={(e) => onNoteChange(e.target.value)}
          aria-label="Edit voice transcript"
        />
      </div>
    );
  }

  if (micBlocked || !supported) {
    return (
      <div className="space-y-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
        <p className="text-destructive">
          {micBlocked
            ? 'Microphone is blocked for this site.'
            : 'Speech recognition is not supported in this browser.'}
        </p>
        <button
          type="button"
          onClick={onSwitchPrompt}
          className="text-secondary underline"
        >
          Type a prompt instead
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Example: “Paid 450 at Swiggy for lunch yesterday.”
      </p>
      <div
        className={`min-h-24 rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm ${
          listening ? 'animate-pulse' : ''
        }`}
      >
        {liveTranscript || (listening ? 'Listening…' : '…')}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onStop}
          className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
        >
          Stop
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </>
  );
}

function PromptPanel({
  phase,
  text,
  onChange,
  onContinue,
  onBack,
  onCancel,
}: {
  phase: CapturePhase;
  text: string;
  onChange: (v: string) => void;
  onContinue: () => void;
  onBack: () => void;
  onCancel: () => void;
}) {
  if (phase === 'choose') {
    return (
      <div className="space-y-2">
        <p className="text-sm font-medium">Prompt ready</p>
        <div className="min-h-20 rounded-lg border border-border bg-muted/40 p-3 text-sm">
          {text}
        </div>
        <button type="button" onClick={onBack} className="text-xs text-muted-foreground underline">
          Edit prompt
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">
        One sentence — AI can structure it on Save, or save as draft as-is.
      </p>
      <textarea
        className="field-input min-h-28 font-mono text-sm"
        placeholder="I paid 500 for Swiggy biryani this morning"
        value={text}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!text.trim()}
          onClick={onContinue}
          className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </>
  );
}

function ManualPanel({
  draft,
  onChange,
  onSave,
  onSaveDraft,
  onCancel,
  busy,
}: {
  busy: boolean;
  draft: DraftTransaction;
  onChange: (d: DraftTransaction) => void;
  onSave: () => void;
  onSaveDraft: () => void;
  onCancel: () => void;
}) {
  const valid = draft.title.trim() && draft.amount > 0;

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) {
          onSave();
        }
      }}
    >
      <p className="text-sm text-muted-foreground">
        Enter fields directly — saved as a finalized transaction, no AI.
      </p>
      <label className="block space-y-1 text-sm">
        <span className="text-muted-foreground">Amount (₹)</span>
        <input
          type="number"
          className="field-input"
          value={draft.amount || ''}
          onChange={(e) =>
            onChange({ ...draft, amount: Number(e.target.value) || 0 })
          }
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted-foreground">Payee / title</span>
        <input
          className="field-input"
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted-foreground">When</span>
        <input
          type="datetime-local"
          className="field-input"
          value={toDateTimeLocalValue(draft.bookedAt)}
          onChange={(e) =>
            onChange({
              ...draft,
              bookedAt: fromDateTimeLocalValue(e.target.value) ?? draft.bookedAt,
            })
          }
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted-foreground">Category</span>
        <input
          className="field-input"
          value={draft.category}
          onChange={(e) => onChange({ ...draft, category: e.target.value })}
        />
      </label>
      <label className="block space-y-1 text-sm">
        <span className="text-muted-foreground">Notes</span>
        <textarea
          className="field-input min-h-16"
          value={draft.notes}
          onChange={(e) => onChange({ ...draft, notes: e.target.value })}
        />
      </label>
      <div className="flex flex-col gap-2 pt-1 sm:flex-row">
        <button
          type="submit"
          disabled={!valid || busy}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? <Spinner /> : null}
          {busy ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          disabled={!draft.title.trim() || busy}
          onClick={onSaveDraft}
          className="flex-1 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-600 disabled:opacity-50 dark:text-amber-100"
        >
          Draft
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="rounded-lg border border-border px-4 py-2.5 text-sm disabled:opacity-50 sm:px-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
