import type { ReactNode } from 'react';

import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <TopBar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-4 md:px-6 md:pb-8 md:pt-6">
          {children}
        </main>
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </div>
  );
}
