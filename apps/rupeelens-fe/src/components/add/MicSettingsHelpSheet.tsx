'use client';

type MicSettingsHelpSheetProps = {
  open: boolean;
  onClose: () => void;
  onUsePrompt: () => void;
  onUseManual: () => void;
};

export function MicSettingsHelpSheet({
  open,
  onClose,
  onUsePrompt,
  onUseManual,
}: MicSettingsHelpSheetProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mic-help-title"
    >
      <div className="glass-card w-full max-w-lg space-y-4 p-5 pb-6">
        <h2 id="mic-help-title" className="text-lg font-semibold text-destructive">
          Microphone blocked
        </h2>
        <p className="text-sm text-muted-foreground">
          Enable the mic for this site in your browser, then return here. You can
          still log expenses by typing a prompt or using the form.
        </p>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          <li>
            Tap the <strong className="text-foreground">lock or tune icon</strong>{' '}
            in the address bar.
          </li>
          <li>
            Open <strong className="text-foreground">Site settings</strong> →{' '}
            <strong className="text-foreground">Microphone</strong> → Allow.
          </li>
          <li>Reload this page if the mic button stays red.</li>
        </ol>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onUsePrompt}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >
            Type a prompt instead
          </button>
          <button
            type="button"
            onClick={onUseManual}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm"
          >
            Manual form
          </button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full text-sm text-muted-foreground underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
