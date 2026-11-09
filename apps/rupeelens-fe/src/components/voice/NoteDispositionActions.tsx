'use client';

import { Spinner } from '@shared-ui';

type NoteDispositionActionsProps = {
  /** Save is in flight (AI structuring happens here). */
  saving?: boolean;
  /** Draft is being stored. */
  drafting?: boolean;
  onChooseSave: () => void;
  onChooseDraft: () => void;
  onChooseCancel: () => void;
};

export function NoteDispositionActions({
  saving = false,
  drafting = false,
  onChooseSave,
  onChooseDraft,
  onChooseCancel,
}: NoteDispositionActionsProps) {
  const busy = saving || drafting;

  return (
    <div className="grid grid-cols-3 gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={onChooseSave}
        className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-60"
      >
        {saving ? <Spinner /> : null}
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onChooseDraft}
        className="flex items-center justify-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm font-medium text-amber-600 disabled:opacity-60 dark:text-amber-100"
      >
        {drafting ? <Spinner /> : null}
        {drafting ? 'Saving…' : 'Draft'}
      </button>
      <button
        type="button"
        disabled={busy}
        onClick={onChooseCancel}
        className="rounded-lg border border-border px-3 py-2.5 text-sm text-muted-foreground disabled:opacity-60"
      >
        Cancel
      </button>
    </div>
  );
}
