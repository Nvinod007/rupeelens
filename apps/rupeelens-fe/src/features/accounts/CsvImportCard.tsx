"use client";

import { fetchWithAuth } from "@auth";
import type { CsvImportResponseDto } from "@shared-types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@shared-ui";
import { useRef, useState } from "react";

import { formatImportResult } from "./format-import-result";
import { ImportResultBanner } from "./ImportResultBanner";
import { parseApiError } from "./parse-api-error";
import { accountsSupabase } from "./supabase-client";

export function CsvImportCard({
  onError,
  onSuccess,
}: {
  onError: (message: string | null) => void;
  onSuccess: () => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bankName, setBankName] = useState("");
  const [maskedAccountNumber, setMaskedAccountNumber] = useState("");
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  async function handleCsvImport(file: File | undefined) {
    if (!file) {
      return;
    }
    if (!bankName.trim()) {
      onError("Enter a bank name before importing");
      return;
    }

    onError(null);
    setImportMessage(null);
    setImporting(true);

    try {
      const csv = await file.text();
      const res = await fetchWithAuth(accountsSupabase, "/imports/csv", {
        body: JSON.stringify({
          bankName: bankName.trim(),
          csv,
          ...(maskedAccountNumber.trim()
            ? { maskedAccountNumber: maskedAccountNumber.trim() }
            : {}),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(await parseApiError(res, "CSV import failed"));
      }

      const data = (await res.json()) as CsvImportResponseDto;
      setImportMessage(formatImportResult(data.imported, data.skipped));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "CSV import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <Card variant="outline">
      <CardHeader>
        <CardTitle>Import bank statement</CardTitle>
        <CardDescription>
          Upload a CSV export from your bank. Expected columns: Date, Narration,
          Debit, Credit.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="bank-name">Bank name</Label>
            <Input
              id="bank-name"
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. HDFC Bank"
              value={bankName}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="masked-account">Account (optional)</Label>
            <Input
              id="masked-account"
              onChange={(e) => setMaskedAccountNumber(e.target.value)}
              placeholder="e.g. XXXX1234"
              value={maskedAccountNumber}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="csv-file">CSV file</Label>
          <Input
            accept=".csv,text/csv"
            disabled={importing}
            id="csv-file"
            onChange={(e) => void handleCsvImport(e.target.files?.[0])}
            ref={fileInputRef}
            type="file"
          />
        </div>
        {importing ? (
          <p className="text-sm text-muted-foreground">Importing…</p>
        ) : null}
        {importMessage ? <ImportResultBanner message={importMessage} /> : null}
      </CardContent>
    </Card>
  );
}
