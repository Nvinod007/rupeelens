import { createSupabaseBrowserClient } from "./browser-client";
import { extractOAuthDisplayName } from "./oauth-display-name";

export type BrowserSessionUser = {
  email: string;
  id: string;
  name: string | null;
};

/** Current signed-in user from the browser Supabase session, or null. */
export async function getBrowserSessionUser(): Promise<BrowserSessionUser | null> {
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;

  if (!user?.email) {
    return null;
  }

  return {
    email: user.email,
    id: user.id,
    name: extractOAuthDisplayName(user),
  };
}
