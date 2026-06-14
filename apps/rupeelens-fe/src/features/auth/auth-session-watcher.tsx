"use client";

import { createSupabaseBrowserClient } from "@auth";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

/**
 * Redirects to /login when the Supabase session ends — including expired refresh
 * token (Supabase emits SIGNED_OUT after a failed silent refresh).
 */
export function AuthSessionWatcher() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
          return;
        }

        if (event === "TOKEN_REFRESHED" && session) {
          return;
        }

        if (session || isPublicPath(pathname)) {
          return;
        }

        console.info("[auth:AuthSessionWatcher] session ended → /login", {
          event,
        });
        router.replace("/login");
      }
    );

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  return null;
}
