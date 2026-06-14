"use client";

import { signInWithGoogle } from "@auth";
import { Button } from "@shared-ui";

export function Login() {
  const handleClick = async () => {
    try {
      await signInWithGoogle();
      window.location.href = "/";
    } catch (error: unknown) {
      console.info("[auth:Login] signInWithGoogle failed", {
        error: error instanceof Error ? error.message : error,
      });
    }
  };

  return <Button onClick={handleClick}>Sign In with Google</Button>;
}
