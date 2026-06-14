"use client";

import { fetchWithAuth } from "@auth";
import type { AccountDto } from "@shared-types";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared-ui";
import { useCallback, useEffect, useState } from "react";

import { CsvImportCard } from "./CsvImportCard";
import { SetuLinkCard } from "./SetuLinkCard";
import { SmsImportCard } from "./SmsImportCard";
import { accountsSupabase } from "./supabase-client";

const setuEnabled = process.env.NEXT_PUBLIC_ENABLE_SETU === "true";

type AccountsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; accounts: AccountDto[] };

export function Accounts() {
  const [state, setState] = useState<AccountsState>({ status: "loading" });
  const [error, setError] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetchWithAuth(accountsSupabase, "/accounts");
      if (!res.ok) {
        throw new Error(`Failed to load accounts (${res.status})`);
      }
      const data = (await res.json()) as AccountDto[];
      setState({ accounts: data, status: "success" });
      setError(null);
    } catch (err) {
      setState({
        message: err instanceof Error ? err.message : "Failed to load accounts",
        status: "error",
      });
    }
  }, []);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const accounts = state.status === "success" ? state.accounts : [];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Accounts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Import bank statements or manage linked accounts.
        </p>
      </div>

      <CsvImportCard onError={setError} onSuccess={loadAccounts} />
      <SmsImportCard onError={setError} onSuccess={loadAccounts} />

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Linked accounts</CardTitle>
          <CardDescription>
            Accounts with imported or synced transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {state.status === "loading" ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : state.status === "error" ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-destructive">{state.message}</p>
              <Button
                onClick={() => void loadAccounts()}
                type="button"
                variant="outline"
              >
                Retry
              </Button>
            </div>
          ) : accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No accounts yet — import via CSV or SMS above.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {accounts.map((account) => (
                <li
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  key={account.id}
                >
                  <div>
                    <p className="font-medium">{account.bankName}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.maskedAccountNumber}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                    {account.source === "SETU" ? "AA" : "Import"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {setuEnabled ? (
        <SetuLinkCard onError={setError} onSuccess={loadAccounts} />
      ) : null}

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
