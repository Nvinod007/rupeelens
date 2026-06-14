import { createSupabaseBrowserClient } from "./browser-client";

export async function signInWithGoogle() {
  console.info("[auth:sign-in] signInWithGoogle start");

  const supabase = createSupabaseBrowserClient();
  const redirectTo = `${window.location.origin}/auth/callback`;

  console.info("[auth:sign-in] signInWithOAuth", { redirectTo });

  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo,
    },
    provider: "google",
  });

  console.info("[auth:sign-in] signInWithOAuth result", {
    error: error?.message ?? null,
    hasUrl: Boolean(data.url),
    provider: data.provider,
    url: data.url,
  });

  if (error) throw error;
}
