"use client";

import { Label, LockIcon } from "@shared-ui";
import Link from "next/link";

import { AuthCard } from "./AuthCard";
import { AuthLayout } from "./AuthLayout";
import { GoogleSignInButton } from "./GoogleSignInButton";

export function Login() {
  return (
    <AuthLayout>
      <AuthCard
        footer={
          <Link
            className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            href="#"
          >
            <LockIcon className="size-4" />
            Privacy &amp; security
          </Link>
        }
      >
        <Label className="block text-center" variant="muted">
          Sign in to continue
        </Label>

        <GoogleSignInButton />

        <p className="text-center text-sm text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link
            className="text-primary underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href="#"
          >
            Terms of Service
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
