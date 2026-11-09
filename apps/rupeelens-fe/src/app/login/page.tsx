'use client';

import { Label, LockIcon } from '@shared-ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AuthCard } from '@/components/auth/AuthCard';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { useAuth } from '@/lib/auth/AuthProvider';
import { hasCurrentConsent, saveLocalConsent } from '@/lib/consent';
import { LEGAL_ROUTES } from '@/lib/legal';

const LINK_CLASS =
  'text-primary underline underline-offset-4 hover:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export default function LoginPage() {
  const { loading, user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // `null` until we have read local storage (avoids a hydration flash).
  const [alreadyConsented, setAlreadyConsented] = useState<boolean | null>(null);
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    setAlreadyConsented(hasCurrentConsent());
  }, []);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/');
    }
  }, [loading, router, user]);

  const needsConsent = alreadyConsented === false;
  const canSignIn = alreadyConsented === true || accepted;

  return (
    <AuthLayout>
      <AuthCard
        footer={
          <Link
            className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            href={LEGAL_ROUTES.privacy}
          >
            <LockIcon className="size-4" />
            Privacy &amp; security
          </Link>
        }
      >
        <Label className="block text-center" variant="muted">
          Sign in to continue
        </Label>

        {needsConsent ? (
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3 text-left text-sm text-muted-foreground">
            <input
              checked={accepted}
              className="mt-0.5 size-4 shrink-0 accent-[hsl(var(--primary))]"
              onChange={(e) => setAccepted(e.target.checked)}
              type="checkbox"
            />
            <span>
              I am 18+ and I agree to the{' '}
              <Link className={LINK_CLASS} href={LEGAL_ROUTES.terms} rel="noopener" target="_blank">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link className={LINK_CLASS} href={LEGAL_ROUTES.privacy} rel="noopener" target="_blank">
                Privacy Policy
              </Link>
              , including processing of my voice notes and expenses as described.
            </span>
          </label>
        ) : null}

        <GoogleSignInButton
          disabled={!canSignIn}
          onBeforeSignIn={saveLocalConsent}
          onError={setError}
        />

        {error ? (
          <p role="alert" className="text-center text-sm text-destructive">
            {error}
          </p>
        ) : null}

        {alreadyConsented ? (
          <p className="text-center text-sm text-muted-foreground">
            By continuing, you agree to our{' '}
            <Link className={LINK_CLASS} href={LEGAL_ROUTES.terms}>
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link className={LINK_CLASS} href={LEGAL_ROUTES.privacy}>
              Privacy Policy
            </Link>
            .
          </p>
        ) : null}
      </AuthCard>
    </AuthLayout>
  );
}
