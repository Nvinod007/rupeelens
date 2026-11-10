'use client';

import { SignOutIcon } from '@shared-ui';

import { useAuth } from '@/lib/auth/AuthProvider';

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  const { signOut } = useAuth();

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className={
        className ??
        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-500/10 dark:text-rose-400'
      }
    >
      <SignOutIcon animated={false} className="size-5 shrink-0" />
      <span>Sign out</span>
    </button>
  );
}
