import { ThemeToggle } from "@shared-ui";
import type { ReactNode } from "react";

import { AppBrand } from "./AppBrand";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:h-16 md:justify-end md:px-6">
          <AppBrand className="md:hidden" />
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
