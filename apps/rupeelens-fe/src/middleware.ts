import { createSupabaseMiddlewareClient } from "@auth/server";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  console.info("[auth:middleware] request", {
    cookieCount: request.cookies.getAll().length,
    pathname,
    search: search || null,
  });

  let response = NextResponse.next({ request });

  const supabase = createSupabaseMiddlewareClient(request, (nextResponse) => {
    response = nextResponse;
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  console.info("[auth:middleware] getUser", {
    error: error?.message ?? null,
    pathname,
    userEmail: user?.email ?? null,
    userId: user?.id ?? null,
  });

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!user && !isPublic) {
    console.info("[auth:middleware] redirect → /login (no session)");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname === "/login") {
    console.info("[auth:middleware] redirect → / (already logged in)");
    return NextResponse.redirect(new URL("/", request.url));
  }

  console.info("[auth:middleware] allow", { pathname });
  return response;
}

/**
 * Next.js reads this automatically — no import elsewhere.
 * `matcher` = which URLs run middleware (pages/routes only).
 * Skips static assets (_next, images, favicon) so auth checks
 * don't run on every CSS/JS/image request.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|webmanifest)$).*)",
  ],
};
