'use client';

import { cn } from '@shared-ui';

type Option<T extends string> = {
  id: T;
  label: string;
};

type SegmentedFilterProps<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
};

/** Matches `field-input` height and border for filter toolbars. */
export function SegmentedFilter<T extends string>({
  label,
  value,
  options,
  onChange,
  ariaLabel,
}: SegmentedFilterProps<T>) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div
        aria-label={ariaLabel ?? label}
        className="flex h-10 items-stretch gap-1 rounded-lg border border-input bg-background/50 p-1"
        role="tablist"
      >
        {options.map((option) => {
          const selected = value === option.id;
          return (
            <button
              key={option.id || 'all'}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(option.id)}
              className={cn(
                'flex min-w-0 flex-1 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors',
                selected
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
