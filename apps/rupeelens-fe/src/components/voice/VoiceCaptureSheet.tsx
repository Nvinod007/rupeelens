'use client';

import { NoteDispositionActions } from '@/components/voice/NoteDispositionActions';

export type VoiceCapturePhase = 'listening' | 'choose';

type VoiceCaptureSheetProps = {
  open: boolean;
  phase: VoiceCapturePhase;
  listening: boolean;
  busy?: boolean;
  transcript: string;
  onClose: () => void;
  onStop: () => void;
  onChooseSave: () => void;
  onChooseDraft: () => void;
  onChooseCancel: () => void;
};

export function VoiceCaptureSheet({
  open,
  phase,
  listening,
  busy = false,
  transcript,
  onClose,
  onStop,
  onChooseSave,
  onChooseDraft,
  onChooseCancel,
}: VoiceCaptureSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="voice-capture-title"
    >
      <div className="glass-card w-full max-w-lg space-y-4 p-5 pb-6">
        <h2 id="voice-capture-title" className="text-lg font-semibold">
          {phase === 'listening' ? 'Listening…' : 'Voice note ready'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {phase === 'listening'
            ? 'Example: “Paid 450 at Swiggy for lunch yesterday.”'
            : 'Choose what to do with this note — nothing posts until you confirm on Save.'}
        </p>
        <div
          className={`min-h-24 rounded-lg border border-border bg-muted/40 p-3 font-mono text-sm ${
            listening && phase === 'listening' ? 'animate-pulse' : ''
          }`}
        >
          {transcript || '…'}
        </div>
        {phase === 'listening' ? (
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
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2.5 text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <NoteDispositionActions
            saving={busy}
            onChooseCancel={onChooseCancel}
            onChooseDraft={onChooseDraft}
            onChooseSave={onChooseSave}
          />
        )}
      </div>
    </div>
  );
}
