import type { SupabaseClient } from "@supabase/supabase-js";

import { extractOAuthDisplayName } from "./oauth-display-name";

/** Matches {@link SupabaseAuthClaims} in `@shared-types`. */
export type VerifiedSupabaseUser = {
  sub: string;
  email?: string | null;
  name?: string | null;
};

export class SupabaseTokenVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SupabaseTokenVerificationError";
  }
}

/** Verify a Supabase access token using an existing server-side client. */
export async function verifySupabaseAccessToken(
  supabase: SupabaseClient,
  accessToken: string
): Promise<VerifiedSupabaseUser> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    throw new SupabaseTokenVerificationError(error?.message ?? "Invalid token");
  }

  return {
    email: user.email,
    name: extractOAuthDisplayName(user),
    sub: user.id,
  };
}
