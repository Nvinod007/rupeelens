'use client';

import { cn } from '../../lib/utils';
import { MonitorIcon, MoonIcon, SunIcon } from '../icons';

export type ThemeValue = 'light' | 'dark' | 'system';

const THEMES = [
  { Icon: SunIcon, label: 'Light', value: 'light' },
  { Icon: MoonIcon, label: 'Dark', value: 'dark' },
  { Icon: MonitorIcon, label: 'System', value: 'system' },
] as const;

type ThemeToggleProps = {
  value: ThemeValue;
  onChange: (value: ThemeValue) => void;
  className?: string;
};

/** Presentational (controlled) theme switcher; the app owns theme state. */
export function ThemeToggle({ className, onChange, value }: ThemeToggleProps) {
  return (
    <div
      aria-label="Theme"
      className={cn(
        'inline-flex items-center rounded-lg border border-border bg-card p-1 shadow-sm',
        className
      )}
      role="group"
    >
      {THEMES.map(({ Icon, label, value: option }) => {
        const isActive = value === option;
        return (
          <button
            key={option}
            aria-label={label}
            aria-pressed={isActive}
            className={cn(
              'group rounded-md p-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            onClick={() => onChange(option)}
            title={label}
            type="button"
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}
