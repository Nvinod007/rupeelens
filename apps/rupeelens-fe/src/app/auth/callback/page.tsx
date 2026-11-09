'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { recordConsentOnAccount } from '@/lib/consent';
import { getSupabase } from '@/lib/supabase/client';

/**
 * OAuth (PKCE) landing page.
 *
 * The Supabase browser client exchanges the `?code=` for a session on its own
 * during initialisation (`detectSessionInUrl`). Exchanging it again here would
 * fail because the one-time code verifier is already consumed, so this page
 * only waits for the resulting session.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const providerError = params.get('error_description');
    if (providerError) {
      setError(providerError);
      return;
    }

    let active = true;
    // `getSession` resolves after the automatic code exchange has finished.
    const supabase = getSupabase();
    void supabase.auth
      .getSession()
      .then(async ({ data, error: sessionError }) => {
        if (!active) {
          return;
        }
        if (sessionError || !data.session) {
          setError(sessionError?.message ?? 'Sign-in failed. Please try again.');
          return;
        }
        await recordConsentOnAccount(supabase);
        if (active) {
          router.replace('/');
        }
      });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center px-4 text-center text-sm">
      {error ? (
        <div className="space-y-3">
          <p role="alert" className="text-destructive">
            {error}
          </p>
          <a className="underline" href="/login">
            Back to sign in
          </a>
        </div>
      ) : (
        <p className="text-muted-foreground">Signing you in…</p>
      )}
    </main>
  );
}
