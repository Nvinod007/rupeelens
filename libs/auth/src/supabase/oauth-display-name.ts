import type { User } from "@supabase/supabase-js";

/** Google OAuth stores display name in user_metadata.full_name or .name */
export function extractOAuthDisplayName(user: User): string | null {
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
