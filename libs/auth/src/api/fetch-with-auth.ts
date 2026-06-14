import type { SupabaseClient } from "@supabase/supabase-js";

export class ApiAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiAuthError";
  }
}

export type FetchWithAuthOptions = RequestInit & {
  apiBaseUrl?: string;
};

export async function fetchWithAuth(
  supabase: SupabaseClient,
  path: string,
  options: FetchWithAuthOptions = {}
): Promise<Response> {
  const { apiBaseUrl = process.env["NEXT_PUBLIC_API_URL"], ...init } = options;

  if (!apiBaseUrl) {
    throw new ApiAuthError("Missing NEXT_PUBLIC_API_URL");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new ApiAuthError("Not signed in");
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return fetch(`${apiBaseUrl}${normalizedPath}`, {
    ...init,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
