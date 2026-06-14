"use client";

import { createSupabaseBrowserClient } from "@auth";
import { useEffect } from "react";

export function SessionLogger() {
  useEffect(() => {
    void (async () => {
      console.info("[auth:SessionLogger] mount on login page");

      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getSession();

      console.info("[auth:SessionLogger] getSession", {
        error: error?.message ?? null,
        hasSession: Boolean(data.session),
        userEmail: data.session?.user.email ?? null,
        userId: data.session?.user.id ?? null,
      });
    })();
  }, []);

  return null;
}
