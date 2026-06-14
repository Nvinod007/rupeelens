"use client";

import { fetchWithAuth } from "@auth";
import type { ImportKeyDto, SmsImportResponseDto } from "@shared-types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@shared-ui";
import { useEffect, useState } from "react";

import { formatImportResult } from "./format-import-result";
import { ImportResultBanner } from "./ImportResultBanner";
import { parseApiError } from "./parse-api-error";
import { accountsSupabase } from "./supabase-client";

export function SmsImportCard({
  onError,
  onSuccess,
}: {
  onError: (message: string | null) => void;
  onSuccess: () => Promise<void>;
}) {
  const [sender, setSender] = useState("");
  const [body, setBody] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [importKey, setImportKey] = useState<string | null>(null);
  const [importKeyLoading, setImportKeyLoading] = useState(true);
  const [copied, setCopied] = useState<"key" | "url" | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";
  const webhookUrl = apiBase ? `${apiBase}/webhooks/sms` : "";

  useEffect(() => {
    let cancelled = false;

    async function loadImportKey() {
      setImportKeyLoading(true);
      try {
        const res = await fetchWithAuth(accountsSupabase, "/auth/import-key");
        if (!res.ok) {
          throw new Error(`Failed to load import key (${res.status})`);
        }
        const data = (await res.json()) as ImportKeyDto;
        if (!cancelled) {
          setImportKey(data.importKey);
        }
      } catch (err) {
        if (!cancelled) {
          setImportKey(null);
          onError(
            err instanceof Error ? err.message : "Failed to load import key"
          );
        }
      } finally {
        if (!cancelled) {
          setImportKeyLoading(false);
        }
      }
    }

    void loadImportKey();
    return () => {
      cancelled = true;
    };
  }, [onError]);

  async function handleSmsImport() {
    if (!body.trim()) {
      onError("Paste an SMS body before importing");
      return;
    }

    onError(null);
    setImportMessage(null);
    setImporting(true);

    try {
      const res = await fetchWithAuth(accountsSupabase, "/imports/sms", {
        body: JSON.stringify({
          body: body.trim(),
          ...(sender.trim() ? { sender: sender.trim() } : {}),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(await parseApiError(res, "SMS import failed"));
      }

      const data = (await res.json()) as SmsImportResponseDto;
      setImportMessage(formatImportResult(data.imported, data.skipped));
      setBody("");
      await onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "SMS import failed");
    } finally {
      setImporting(false);
    }
  }

  async function copyText(value: string, kind: "key" | "url") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      onError("Could not copy to clipboard");
    }
  }

  return (
    <Card variant="outline">
      <CardHeader>
        <CardTitle>Import SMS</CardTitle>
        <CardDescription>
          Paste a bank SMS to import (works for older messages too). Or
          auto-forward new ones from your phone via MacroDroid.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sms-sender">Sender (optional)</Label>
            <Input
              id="sms-sender"
              onChange={(e) => setSender(e.target.value)}
              placeholder="e.g. AX-ICICIT-S"
              value={sender}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sms-body">SMS body</Label>
            <textarea
              className="flex min-h-[120px] w-full resize-y rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
              disabled={importing}
              id="sms-body"
              onChange={(e) => setBody(e.target.value)}
              placeholder="Acct XX1234 debited for INR 99.00. UPI/zepto@ybl"
              value={body}
            />
          </div>
          <Button
            disabled={importing || !body.trim()}
            onClick={() => void handleSmsImport()}
            type="button"
          >
            {importing ? "Importing…" : "Import SMS"}
          </Button>
          {importMessage ? (
            <ImportResultBanner message={importMessage} />
          ) : null}
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4">
          <p className="text-sm font-medium">Phone auto-import</p>
          <p className="text-sm text-muted-foreground">
            Forward bank SMS to this webhook with your personal import key
            (MacroDroid, Tasker, etc.).
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="import-key">Import key</Label>
            <div className="flex gap-2">
              <Input
                className="font-mono text-xs"
                id="import-key"
                readOnly
                value={
                  importKeyLoading ? "Loading…" : (importKey ?? "Unavailable")
                }
              />
              <Button
                disabled={!importKey}
                onClick={() =>
                  importKey ? void copyText(importKey, "key") : undefined
                }
                type="button"
                variant="outline"
              >
                {copied === "key" ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                className="font-mono text-xs"
                id="webhook-url"
                readOnly
                value={webhookUrl || "Set NEXT_PUBLIC_API_URL"}
              />
              <Button
                disabled={!webhookUrl}
                onClick={() =>
                  webhookUrl ? void copyText(webhookUrl, "url") : undefined
                }
                type="button"
                variant="outline"
              >
                {copied === "url" ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            {`POST ${webhookUrl || "<api>/webhooks/sms"}
Header: x-import-key: <your-import-key>
Body: {"sender":"HDFC","body":"<sms text>"}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
