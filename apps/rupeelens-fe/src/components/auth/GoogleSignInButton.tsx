'use client';

import { Button, GoogleIcon } from '@shared-ui';
import { useState } from 'react';

import { useAuth } from '@/lib/auth/AuthProvider';

type GoogleSignInButtonProps = {
  /** Blocks sign-in until the user has accepted the legal documents. */
  disabled?: boolean;
  /** Runs right before the redirect to Google (e.g. persist consent). */
  onBeforeSignIn?: () => void;
  onError: (message: string) => void;
};

export function GoogleSignInButton({
  disabled = false,
  onBeforeSignIn,
  onError,
}: GoogleSignInButtonProps) {
  const { loading: sessionLoading, signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      onBeforeSignIn?.();
      await signInWithGoogle();
    } catch (error: unknown) {
      onError(error instanceof Error ? error.message : 'Could not start sign-in');
      setLoading(false);
    }
  };

  return (
    <Button
      aria-busy={loading}
      className="group h-12 w-full rounded-xl text-base font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md active:scale-[0.98] disabled:opacity-60 [&_svg]:size-5"
      color="primary"
      disabled={disabled || loading || sessionLoading}
      onClick={handleClick}
      type="button"
      variant="outline"
    >
      <GoogleIcon className="size-5" />
      {loading ? 'Signing in…' : 'Continue with Google'}
    </Button>
  );
}
