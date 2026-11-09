'use client';

import { ThemeToggle } from '@shared-ui';

import { useTheme } from '@/lib/theme';

import { AppBrand } from './AppBrand';

export function TopBar() {
  const { mode, setMode } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 px-4 py-3 backdrop-blur md:px-6 md:py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="md:hidden">
          <AppBrand compact />
        </div>
        <DesktopGreeting />
        <ThemeToggle onChange={setMode} value={mode} />
      </div>
    </header>
  );
}

function DesktopGreeting() {
  const hour = new Date().getHours();
  const part =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="hidden min-w-0 flex-1 md:block">
      <p className="truncate text-sm text-muted-foreground">{part}</p>
      <h1 className="text-lg font-semibold tracking-tight">
        Voice transactions
      </h1>
    </div>
  );
}
