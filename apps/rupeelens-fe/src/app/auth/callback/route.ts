import { createSupabaseServerClient } from "@auth/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  console.info("[auth:callback] GET /auth/callback", {
    codePresent: Boolean(code),
    origin,
    search: requestUrl.search || null,
  });

  if (code) {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    console.info("[auth:callback] exchangeCodeForSession", {
      error: error?.message ?? null,
      userEmail: data.user?.email ?? null,
      userId: data.user?.id ?? null,
    });

    if (!error) {
      console.info("[auth:callback] redirect → /");
      return NextResponse.redirect(`${origin}/`);
    }
  }

  console.info(
    "[auth:callback] redirect → /login (no code or exchange failed)"
  );
  return NextResponse.redirect(`${origin}/login`);
}
