"use client";

import { createSupabaseBrowserClient, fetchWithAuth } from "@auth";
import type { Transaction } from "@shared-types";
import {
  BankIcon,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  RupeeIcon,
} from "@shared-ui";
import { formatShortDate, formatSignedInrAmount } from "@shared-utils";
import { useCallback, useEffect, useState } from "react";

import { getTransactionDisplayName } from "@/shared/utils";

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; transactions: Transaction[] };

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isCredit = transaction.direction === "CREDIT";

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 space-y-1">
        <p className="truncate font-medium text-foreground">
          {getTransactionDisplayName(transaction)}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>{formatShortDate(transaction.bookedAt)}</span>
          {transaction.category ? (
            <>
              <span aria-hidden className="text-border">
                ·
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {transaction.category}
              </span>
            </>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <BankIcon animated={false} className="size-3.5 shrink-0" />
          <span className="truncate">
            {transaction.account.bankName} ·{" "}
            {transaction.account.maskedAccountNumber}
          </span>
        </div>
      </div>
      <p
        className={`shrink-0 text-right text-base font-semibold tabular-nums sm:text-lg ${
          isCredit ? "text-primary" : "text-destructive"
        }`}
      >
        {formatSignedInrAmount(transaction.amount, transaction.direction)}
      </p>
    </li>
  );
}

function TransactionListSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading transactions"
      className="space-y-4"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex animate-pulse items-center justify-between gap-4 py-2"
        >
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/5 rounded bg-muted" />
            <div className="h-3 w-1/4 rounded bg-muted" />
          </div>
          <div className="h-5 w-20 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function TransactionList() {
  const [state, setState] = useState<FetchState>({ status: "loading" });

  const loadTransactions = useCallback(async () => {
    setState({ status: "loading" });

    try {
      const supabase = createSupabaseBrowserClient();
      const response = await fetchWithAuth(supabase, "/transactions");

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message =
          typeof body?.message === "string"
            ? body.message
            : `Failed to load transactions (${response.status})`;
        setState({ message, status: "error" });
        return;
      }

      const data = (await response.json()) as Transaction[];
      setState({ status: "success", transactions: data });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      setState({ message, status: "error" });
    }
  }, []);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your unified UPI ledger across linked accounts.
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            {state.status === "success"
              ? `${state.transactions.length} transaction${state.transactions.length === 1 ? "" : "s"}`
              : "Loading your latest transactions"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {state.status === "loading" ? <TransactionListSkeleton /> : null}

          {state.status === "error" ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-sm text-destructive">{state.message}</p>
              <Button
                color="primary"
                onClick={() => void loadTransactions()}
                variant="outline"
              >
                Try again
              </Button>
            </div>
          ) : null}

          {state.status === "success" && state.transactions.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-full border border-border bg-muted">
                <RupeeIcon className="size-7 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  No transactions yet
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Link a bank account to start seeing your UPI and card activity
                  here.
                </p>
              </div>
            </div>
          ) : null}

          {state.status === "success" && state.transactions.length > 0 ? (
            <ul className="divide-y divide-border">
              {state.transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
