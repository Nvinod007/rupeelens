type TransactionsEmptyStateProps = {
  onAdd?: () => void;
};

export function TransactionsEmptyState({ onAdd }: TransactionsEmptyStateProps) {
  return (
    <div className="glass-card flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-2xl">
        ＋
      </div>
      <div className="space-y-1">
        <p className="font-medium">No transactions yet</p>
        <p className="text-sm text-muted-foreground">
          Add with mic, a one-line prompt, or the form — then Save, Draft, or
          Cancel.
        </p>
      </div>
      {onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Add expense
        </button>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Browser speech may use Google or Apple for recognition.
      </p>
    </div>
  );
}
