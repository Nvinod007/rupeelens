import type { SupabaseClient } from '@supabase/supabase-js';

import { LEGAL } from './legal';

const STORAGE_KEY = 'rupeelens-consent';

type StoredConsent = { version: string; acceptedAt: string };

function read(): StoredConsent | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredConsent) : null;
  } catch {
    return null;
  }
}

/** True when this browser already accepted the *current* legal version. */
export function hasCurrentConsent(): boolean {
  return read()?.version === LEGAL.version;
}

export function saveLocalConsent(): void {
  const consent: StoredConsent = {
    acceptedAt: new Date().toISOString(),
    version: LEGAL.version,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
}

/**
 * Copies the consent given on the login screen onto the user's account
 * (auth user metadata) so there is a record tied to the signed-in identity.
 * Never blocks sign-in: failures are swallowed.
 */
export async function recordConsentOnAccount(
  supabase: SupabaseClient
): Promise<void> {
  const local = read();
  if (!local) {
    return;
  }
  try {
    const { data } = await supabase.auth.getUser();
    if (data.user?.user_metadata?.['consent_version'] === local.version) {
      return;
    }
    await supabase.auth.updateUser({
      data: { consent_at: local.acceptedAt, consent_version: local.version },
    });
  } catch {
    // Consent record is best-effort; the user is already authenticated.
  }
}
