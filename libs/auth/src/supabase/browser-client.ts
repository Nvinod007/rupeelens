import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./config";

export function createSupabaseBrowserClient(): ReturnType<
  typeof createBrowserClient
> {
  const { anonKey, url } = getSupabaseEnv();
  console.info("[auth:browser-client] creating browser client");
  return createBrowserClient(url, anonKey);
}
