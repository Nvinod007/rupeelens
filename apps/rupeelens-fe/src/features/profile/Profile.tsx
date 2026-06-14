"use client";

import { getBrowserSessionUser } from "@auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  UserIcon,
} from "@shared-ui";
import { useEffect, useState } from "react";

import { Logout } from "@/features/auth";

export function Profile() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const user = await getBrowserSessionUser();
      setEmail(user?.email ?? null);
    })();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account settings and preferences.
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Signed in with Google</CardTitle>
          <CardDescription>
            RupeeLens uses Google-only sign-in for now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
              <UserIcon animated={false} className="size-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{email ?? "Loading…"}</p>
              <p className="text-xs text-muted-foreground">Google account</p>
            </div>
          </div>

          <Separator variant="muted" />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Sign out of RupeeLens on this device.
            </p>
            <Logout />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
