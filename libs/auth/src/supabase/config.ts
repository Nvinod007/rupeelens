export function getSupabaseEnv() {
  const url = process.env["NEXT_PUBLIC_SUPABASE_URL"];
  const anonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"];

  console.info("[auth:config] getSupabaseEnv", {
    hasAnonKey: Boolean(anonKey),
    hasUrl: Boolean(url),
    url,
  });

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return { anonKey, url };
}
