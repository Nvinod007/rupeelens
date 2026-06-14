"use client";

import { getBrowserSessionUser } from "@auth";
import { displayNameFromEmail, getTimeOfDayGreeting } from "@shared-utils";
import { useEffect, useState } from "react";

export function DashboardGreeting() {
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const user = await getBrowserSessionUser();

      if (user) {
        setDisplayName(displayNameFromEmail(user.name ?? user.email));
      }
    })();
  }, []);

  return (
    <div>
      <p className="text-sm text-muted-foreground">{getTimeOfDayGreeting()}</p>
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
        {displayName ? `Welcome back, ${displayName}` : "Welcome back"}
      </h1>
    </div>
  );
}
