"use client";

import { BankIcon, InsightsIcon, RupeeIcon, ThemeToggle } from "@shared-ui";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="selection:bg-primary selection:text-primary-foreground">
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-background p-4 text-foreground md:p-6">
        <ThemeToggle className="absolute right-4 top-4 z-20 md:right-6 md:top-6" />

        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 bg-auth-dot-grid bg-auth-dot"
        />

        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 overflow-hidden"
        >
          <div className="absolute -left-24 -top-24 size-72 rounded-full bg-primary opacity-[0.05] blur-[120px]" />
          <div className="absolute -right-32 top-1/2 size-80 rounded-full bg-secondary opacity-[0.05] blur-[120px]" />

          <svg
            className="absolute inset-0 h-full w-full opacity-[0.08]"
            fill="none"
            viewBox="0 0 1000 1000"
          >
            <path
              className="opacity-20"
              d="M-100 200C200 150 400 450 1100 300"
              stroke="url(#auth-gradient-line)"
              strokeWidth="2"
            />
            <path
              className="opacity-20"
              d="M-100 800C300 700 600 900 1100 750"
              stroke="url(#auth-gradient-line)"
              strokeWidth="2"
            />
            <defs>
              <linearGradient
                id="auth-gradient-line"
                x1="0"
                x2="1000"
                y1="0"
                y2="0"
              >
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute left-[10%] top-[60%] hidden animate-auth-float [animation-delay:1s] sm:block">
            <div className="flex size-14 items-center justify-center rounded-full border border-border bg-card shadow-xl">
              <InsightsIcon className="size-6 text-destructive" />
            </div>
          </div>
          <div className="absolute left-[20%] top-[15%] hidden animate-auth-float md:block">
            <div className="flex size-16 items-center justify-center rounded-full border border-border bg-card shadow-xl">
              <RupeeIcon className="size-7 text-primary" />
            </div>
          </div>
          <div className="absolute bottom-[20%] right-[15%] hidden animate-auth-float [animation-delay:2s] sm:block">
            <div className="flex size-12 items-center justify-center rounded-full border border-border bg-card shadow-xl">
              <BankIcon className="size-5 text-secondary" />
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
