import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getSupabaseEnv } from "./config";

export function createSupabaseMiddlewareClient(
  request: NextRequest,
  setResponse: (response: NextResponse) => void
): ReturnType<typeof createServerClient> {
  const { url, anonKey } = getSupabaseEnv();

  console.info("[auth:middleware-client] creating middleware client");

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        console.info(
          "[auth:middleware-client] setAll cookies",
          cookiesToSet.map(({ name }) => name)
        );
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        const nextResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          nextResponse.cookies.set(name, value, options)
        );
        setResponse(nextResponse);
      },
    },
  });
}
