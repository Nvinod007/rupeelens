"use client";

import { fetchWithAuth } from "@auth";
import type { ConsentResponseDto, CreateConsentDto } from "@shared-types";
import {
  BankIcon,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared-ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { parseApiError } from "./parse-api-error";
import { accountsSupabase } from "./supabase-client";

const defaultConsentBody: CreateConsentDto = {
  dateRange: {
    from: new Date(Date.now() - 365 * 86_400_000).toISOString(),
    to: new Date().toISOString(),
  },
  fiTypes: ["DEPOSIT"],
  purpose: "Personal finance tracking",
};

type MockStatus = "idle" | "approving" | "linked" | "error";

export function SetuLinkCard({
  onError,
  onSuccess,
}: {
  onError: (message: string | null) => void;
  onSuccess: () => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const [linking, setLinking] = useState(false);
  const [mockStatus, setMockStatus] = useState<MockStatus>("idle");

  useEffect(() => {
    const consentId = searchParams.get("consent");
    const isMock = searchParams.get("mock") === "1";
    if (!consentId || !isMock || mockStatus !== "idle") {
      return;
    }

    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase) {
      setMockStatus("error");
      onError("Missing NEXT_PUBLIC_API_URL");
      return;
    }

    setMockStatus("approving");

    fetch(`${apiBase}/webhooks/setu`, {
      body: JSON.stringify({
        consentId,
        data: { status: "ACTIVE" },
        timestamp: new Date().toISOString(),
        type: "CONSENT_STATUS_UPDATE",
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Webhook failed (${res.status})`);
        }
        setMockStatus("linked");
        return onSuccess();
      })
      .catch((err: unknown) => {
        setMockStatus("error");
        onError(err instanceof Error ? err.message : "Mock approval failed");
      });
  }, [mockStatus, onError, onSuccess, searchParams]);

  async function handleLinkBank() {
    onError(null);
    setLinking(true);

    try {
      const res = await fetchWithAuth(accountsSupabase, "/consents", {
        body: JSON.stringify(defaultConsentBody),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(await parseApiError(res, "Request failed"));
      }

      const data = (await res.json()) as ConsentResponseDto;
      if (!data.redirectUrl) {
        throw new Error("No redirect URL returned");
      }

      window.location.href = data.redirectUrl;
    } catch (err) {
      onError(err instanceof Error ? err.message : "Failed to start consent");
      setLinking(false);
    }
  }

  return (
    <Card variant="ghost" size="sm">
      <CardHeader>
        <CardTitle>Account Aggregator (experimental)</CardTitle>
        <CardDescription>
          Setu mock/sandbox flow — requires ENABLE_SETU on the backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-full bg-secondary/10">
          <BankIcon animated={false} className="size-6 text-secondary" />
        </div>
        {mockStatus === "approving" ? (
          <p className="text-sm text-muted-foreground">
            Mock mode — simulating bank approval…
          </p>
        ) : null}
        {mockStatus === "linked" ? (
          <Link
            className="text-sm text-secondary underline-offset-4 hover:underline"
            href="/transactions"
          >
            View transactions →
          </Link>
        ) : (
          <Button
            color="secondary"
            disabled={linking || mockStatus === "approving"}
            onClick={handleLinkBank}
            type="button"
            variant="outline"
          >
            {linking ? "Starting…" : "Link bank (Setu)"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
