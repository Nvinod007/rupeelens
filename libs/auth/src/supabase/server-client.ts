import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { getSupabaseEnv } from "./config";

export async function createSupabaseServerClient(): Promise<
  ReturnType<typeof createServerClient>
> {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabaseEnv();

  console.info("[auth:server-client] creating server client");

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        console.info(
          "[auth:server-client] setAll cookies",
          cookiesToSet.map(({ name }) => name)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}
