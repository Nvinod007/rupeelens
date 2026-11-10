'use client';

import { useEffect, useState, type ReactNode } from 'react';

import type { DraftTransaction } from '@shared-types';
import { MicIcon, Spinner } from '@shared-ui';

import { AiSettingsLink } from '@/components/common/AiSettingsLink';
import { CategoryField } from '@/components/common/CategoryField';
import {
  amountFromInput,
  clampBookedAtToNow,
  fromDateTimeLocalValue,
  maxDateTimeLocalValue,
  sanitizeAmountInput,
  toDateTimeLocalValue,
} from '@shared-utils';

type DraftEditSheetProps = {
  open: boolean;
  draft: DraftTransaction;
  onChange: (draft: DraftTransaction) => void;
  onSave: () => void;
  onDiscard: () => void;
  onRefineAi?: () => void;
  refining?: boolean;
  /** Save is in flight. */
  saving?: boolean;
  saveError?: string | null;
  refineError?: string | null;
  /** Editing an already-saved transaction. */
  saved?: boolean;
  /** Delete this transaction; omit for a brand-new (unsaved) one. */
  onDelete?: () => void;
  deleting?: boolean;
  /** Original voice note / prompt this transaction came from. */
  note: string;
  onNoteChange: (note: string) => void;
  /** Mic re-recording; omit `onToggleDictation` to hide the mic. */
  dictating?: boolean;
  onToggleDictation?: () => void;
};

export function DraftEditSheet({
  open,
  draft,
  onChange,
  onSave,
  onDiscard,
  onRefineAi,
  refining,
  saving,
  saveError,
  refineError,
  saved,
  onDelete,
  deleting,
  note,
  onNoteChange,
  dictating,
  onToggleDictation,
}: DraftEditSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-edit-title"
    >
      <DraftForm
        draft={draft}
        onChange={onChange}
        onSave={onSave}
        onDiscard={onDiscard}
        onRefineAi={onRefineAi}
        refining={refining}
        saving={saving}
        saveError={saveError}
        note={note}
        onNoteChange={onNoteChange}
        dictating={dictating}
        onToggleDictation={onToggleDictation}
        refineError={refineError}
        saved={saved}
        onDelete={onDelete}
        deleting={deleting}
      />
    </div>
  );
}

function DraftForm({
  draft,
  onChange,
  onSave,
  onDiscard,
  onRefineAi,
  refining,
  saving,
  saveError,
  refineError,
  saved,
  onDelete,
  deleting,
  note,
  onNoteChange,
  dictating,
  onToggleDictation,
}: Omit<DraftEditSheetProps, 'open'>) {
  const busy = Boolean(saving || refining || deleting);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [amountText, setAmountText] = useState('');

  useEffect(() => {
    setAmountText(
      draft.amount > 0 ? sanitizeAmountInput(String(draft.amount)) : ''
    );
  }, [draft.amount]);

  return (
    <form
      className="glass-card w-full max-w-lg space-y-4 p-5 pb-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <DraftHeader saved={saved} />
      <section className="space-y-2 rounded-lg border border-border bg-background/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">Your note</span>
          {onToggleDictation ? (
            <button
              type="button"
              aria-pressed={dictating}
              disabled={busy}
              onClick={onToggleDictation}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium disabled:opacity-50 ${
                dictating
                  ? 'border-destructive/60 bg-destructive/10 text-destructive'
                  : 'border-border text-muted-foreground'
              }`}
            >
              <MicIcon className="size-3.5" />
              {dictating ? 'Stop' : 'Re-record'}
            </button>
          ) : null}
        </div>
        <textarea
          className="field-input min-h-20"
          disabled={dictating}
          placeholder="Type or record what you spent, e.g. “500 on Swiggy biryani today”"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          aria-label="Original note"
        />
        {onRefineAi ? (
          <>
            <button
              type="button"
              disabled={busy || dictating || !note.trim()}
              onClick={onRefineAi}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-secondary/50 bg-secondary/10 px-4 py-2 text-sm font-medium text-secondary disabled:opacity-50"
            >
              {refining ? <Spinner /> : null}
              {refining ? 'Refining…' : 'Refine with AI'}
            </button>
            {refineError ? (
              <div className="space-y-1 text-xs">
                <p className="text-amber-600 dark:text-amber-200">
                  {refineError}
                </p>
                <AiSettingsLink />
              </div>
            ) : null}
          </>
        ) : null}
      </section>
      <Field label="Amount (₹)">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          className="field-input"
          value={amountText}
          onChange={(e) => {
            const next = sanitizeAmountInput(e.target.value);
            setAmountText(next);
            onChange({ ...draft, amount: amountFromInput(next) });
          }}
        />
      </Field>
      <Field label="Payee">
        <input
          className="field-input"
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
        />
      </Field>
      <Field label="When">
        <input
          type="datetime-local"
          className="field-input"
          max={maxDateTimeLocalValue()}
          value={toDateTimeLocalValue(draft.bookedAt)}
          onChange={(e) => {
            const iso = fromDateTimeLocalValue(e.target.value);
            onChange({
              ...draft,
              bookedAt: iso
                ? clampBookedAtToNow(iso)
                : draft.bookedAt,
            });
          }}
        />
      </Field>
      <Field label="Category">
        <CategoryField
          value={draft.category}
          onChange={(category) => onChange({ ...draft, category })}
        />
      </Field>
      <Field label="Notes">
        <textarea
          className="field-input min-h-20"
          value={draft.notes}
          onChange={(e) => onChange({ ...draft, notes: e.target.value })}
        />
      </Field>
      {saveError ? (
        <p role="alert" className="text-sm text-destructive">
          {saveError}
        </p>
      ) : null}
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {saving ? <Spinner /> : null}
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          disabled={Boolean(saving || deleting)}
          onClick={onDiscard}
          className="rounded-lg border border-border px-4 py-2.5 text-sm disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
      {onDelete ? (
        <div className="border-t border-border pt-3">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <p className="flex-1 text-sm text-muted-foreground">
                Delete this transaction?
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmDelete(false)}
                className="rounded-lg border border-border px-3 py-2 text-sm disabled:opacity-60"
              >
                Keep
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onDelete}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
              >
                {deleting ? <Spinner /> : null}
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
              className="text-sm text-red-500 underline-offset-4 hover:underline disabled:opacity-60"
            >
              Delete transaction
            </button>
          )}
        </div>
      ) : null}
    </form>
  );
}

function DraftHeader({ saved }: { saved?: boolean }) {
  return (
    <div>
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          saved ? 'bg-primary/20 text-primary' : 'bg-amber-500/20 text-amber-200'
        }`}
      >
        {saved ? 'Saved' : 'Draft'}
      </span>
      <h2 id="draft-edit-title" className="mt-2 text-lg font-semibold">
        {saved ? 'Edit transaction' : 'Review before saving'}
      </h2>
      <p className="text-sm text-muted-foreground">
        {saved
          ? 'Changes apply when you save.'
          : 'Nothing is posted until you confirm.'}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
