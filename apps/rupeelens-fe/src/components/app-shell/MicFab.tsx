'use client';

import type { ReactNode } from 'react';

type MicFabProps = {
  micBlocked: boolean;
  onPress: () => void;
};

export function MicFab({ micBlocked, onPress }: MicFabProps) {
  return (
    <>
      <MobileFabWrap>
        <MicButton micBlocked={micBlocked} onPress={onPress} size="lg" />
      </MobileFabWrap>
      <div className="pointer-events-none fixed bottom-8 right-6 z-50 hidden md:block lg:right-10">
        <MicButton
          micBlocked={micBlocked}
          label="Add expense"
          onPress={onPress}
          size="md"
        />
      </div>
    </>
  );
}

function MobileFabWrap({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-50 -translate-x-1/2 md:hidden">
      {children}
    </div>
  );
}

function MicButton({
  micBlocked,
  onPress,
  size,
  label,
}: {
  micBlocked: boolean;
  onPress: () => void;
  size: 'lg' | 'md';
  label?: string;
}) {
  const dim = size === 'lg' ? 'size-16' : 'size-14';
  const title = micBlocked
    ? 'Enable microphone in browser settings'
    : 'Add expense — voice, prompt, or form';

  return (
    <div className="group pointer-events-auto relative">
      <button
        type="button"
        onClick={onPress}
        title={title}
        aria-label={title}
        className={`flex items-center gap-3 rounded-full text-primary-foreground shadow-lg ring-4 transition hover:scale-[1.02] active:scale-95 ${dim} ${
          label ? 'w-auto px-5' : 'justify-center'
        } ${
          micBlocked
            ? 'bg-destructive shadow-destructive/30 ring-destructive/25'
            : 'bg-primary shadow-primary/25 ring-primary/20'
        }`}
      >
        <MicIcon
          className={size === 'lg' ? 'size-7' : 'size-6'}
          blocked={micBlocked}
        />
        {label ? (
          <span className="pr-1 text-sm font-semibold">
            {micBlocked ? 'Mic blocked' : label}
          </span>
        ) : null}
      </button>
      {micBlocked ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 hidden w-52 -translate-x-1/2 rounded-md border border-border bg-background px-2 py-1.5 text-center text-xs text-foreground opacity-0 shadow-md transition group-hover:opacity-100 md:block"
        >
          Enable microphone in browser settings
        </div>
      ) : null}
    </div>
  );
}

function MicIcon({
  className,
  blocked,
}: {
  className?: string;
  blocked?: boolean;
}) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      {blocked ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5M6 10h2m8 0h2M8 11a4 4 0 008 0M10 18h4"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 14a3 3 0 003-3V6a3 3 0 10-6 0v5a3 3 0 003 3zm0 0v4m-4 0h8M8 11a4 4 0 008 0"
        />
      )}
    </svg>
  );
}
