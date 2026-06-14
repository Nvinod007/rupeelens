"use client";

import { createSupabaseBrowserClient, fetchWithAuth } from "@auth";
import { Button } from "@shared-ui";

export function TestBE() {
  const handleClick = async () => {
    try {
      const supabase = createSupabaseBrowserClient();
      const response = await fetchWithAuth(supabase, "/transactions");

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        console.info("[TestBE] API error", {
          body,
          status: response.status,
        });
        return;
      }

      const data = await response.json();
      console.info("[TestBE] data", data);
    } catch (error: unknown) {
      console.info("[TestBE] error", error);
    }
  };

  return <Button onClick={handleClick}>Test BE</Button>;
}
