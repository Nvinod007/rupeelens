'use client';

import { useAuth } from '@/lib/auth/AuthProvider';

export function AccountCard() {
  const { signOut, user } = useAuth();

  return (
    <section className="glass-card space-y-3 p-4 text-sm">
      <h2 className="text-base font-semibold">Account</h2>
      <p className="text-muted-foreground">
        Signed in as <span className="text-foreground">{user?.email ?? 'unknown'}</span>
      </p>
      <button
        type="button"
        onClick={() => void signOut()}
        className="rounded-lg border border-border px-3 py-1.5 text-sm"
      >
        Sign out
      </button>
    </section>
  );
}
