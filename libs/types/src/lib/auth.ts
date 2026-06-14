/**
 * Claims from a verified Supabase access token.
 * Matches `VerifiedSupabaseUser` returned by `@auth` `verifySupabaseAccessToken`.
 */
export type SupabaseAuthClaims = {
  sub: string;
  email?: string | null;
  name?: string | null;
};
