import { memo } from 'react';

type HomeIntroProps = {
  micBlocked: boolean;
  onAdd: () => void;
  onAddExpense: () => void;
};

export const HomeIntro = memo(function HomeIntro({
  micBlocked,
  onAdd,
  onAddExpense,
}: HomeIntroProps) {
  return (
    <header className="mb-4 space-y-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 md:hidden">
          <h1 className="text-xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Mic, prompt, or form → Save (AI + review), Draft, or Cancel.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddExpense}
          className="hidden shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-95 md:inline-flex"
        >
          Add expense
        </button>
      </div>
      {micBlocked ? (
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-secondary underline md:hidden"
        >
          Mic blocked — type or use the form
        </button>
      ) : null}
    </header>
  );
});
