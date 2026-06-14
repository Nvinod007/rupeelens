"use client";

import { signOut } from "@auth";
import { Button } from "@shared-ui";

export function Logout() {
  const handleClick = async () => {
    try {
      await signOut();
      window.location.href = "/login";
    } catch (error: unknown) {
      console.info("[auth:Logout] signOut failed", {
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  return <Button onClick={handleClick}>Sign Out</Button>;
}
