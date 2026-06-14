import type { SupabaseClient, User } from "@supabase/supabase-js";

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

/** Google OAuth stores display name in user_metadata.full_name or .name */
function extractOAuthDisplayName(user: User): string | null {
  const metadata = user.user_metadata as Record<string, unknown> | undefined;
  if (!metadata) {
    return null;
  }

  const candidate = metadata["full_name"] ?? metadata["name"];
  if (typeof candidate !== "string") {
    return null;
  }

  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : null;
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
