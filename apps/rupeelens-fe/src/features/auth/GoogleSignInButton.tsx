"use client";

import { signInWithGoogle } from "@auth";
import { Button, GoogleIcon } from "@shared-ui";
import { useState } from "react";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const oauthUrl = await signInWithGoogle();
      window.location.href = oauthUrl;
    } catch (error: unknown) {
      console.info("[auth:GoogleSignInButton] signInWithGoogle failed", {
        error: error instanceof Error ? error.message : error,
      });
      setLoading(false);
    }
  };

  return (
    <Button
      aria-busy={loading}
      className="group h-12 w-full rounded-xl text-base font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:shadow-md active:scale-[0.98] disabled:opacity-70 [&_svg]:size-5"
      color="primary"
      disabled={loading}
      onClick={handleClick}
      type="button"
      variant="outline"
    >
      <GoogleIcon className="size-5" />
      {loading ? "Signing in…" : "Continue with Google"}
    </Button>
  );
}
