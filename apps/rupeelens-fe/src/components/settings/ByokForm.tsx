'use client';

import { isLikelyGeminiKey } from '@shared-utils';
import { useCallback, useState } from 'react';

import {
  useAiUsage,
  useByokStatus,
  useRevokeByok,
  useSaveByok,
} from '@/lib/queries/byok';

const AI_STUDIO_URL = 'https://aistudio.google.com/api-keys';

export function ByokForm() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [consent, setConsent] = useState(false);
  const status = useByokStatus();
  const aiUsage = useAiUsage();
  const saveMutation = useSaveByok();
  const revokeMutation = useRevokeByok();
  const configured = status.data?.configured ?? false;
  const loaded = !status.isLoading;
  const saving = saveMutation.isPending;
  const revoking = revokeMutation.isPending;
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onRevoke = useCallback(async () => {
    if (!window.confirm('Remove your stored Gemini key? AI parsing will stop until you add one again.')) {
      return;
    }
    setError(null);
    try {
      await revokeMutation.mutateAsync();
      setMessage(null);
      setConsent(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not remove key');
    }
  }, [revokeMutation]);

  const onSave = useCallback(async () => {
    setError(null);
    setMessage(null);
    if (!isLikelyGeminiKey(apiKey)) {
      setError('Key should start with AIza… or AQ.… and be pasted in full.');
      return;
    }
    if (!consent) {
      setError('Please confirm you accept provider terms and billing.');
      return;
    }
    try {
      await saveMutation.mutateAsync({
        apiKey: apiKey.trim(),
        consentAccepted: consent,
      });
      setApiKey('');
      setMessage('Key saved. Your first voice parse will validate it.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save key');
    }
  }, [apiKey, consent, saveMutation]);

  if (!loaded) {
    return (
      <section className="glass-card p-4 text-sm text-muted-foreground">
        Checking API key…
      </section>
    );
  }

  if (configured) {
    return (
      <section className="glass-card space-y-3 p-4">
        <div>
          <h2 className="text-base font-semibold">Gemini API key (BYOK)</h2>
          <p className="text-sm text-primary">✓ Key stored on your account</p>
          {aiUsage.data ? (
            <p className="mt-1 text-xs text-muted-foreground">
              AI parses today: {aiUsage.data.used} / {aiUsage.data.limit} (resets
              midnight IST)
            </p>
          ) : null}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button
          type="button"
          disabled={revoking}
          onClick={() => void onRevoke()}
          className="w-full rounded-lg border border-destructive/50 px-4 py-2.5 text-sm font-medium text-destructive disabled:opacity-50"
        >
          {revoking ? 'Removing…' : 'Revoke key'}
        </button>
      </section>
    );
  }

  return (
    <section className="glass-card space-y-4 p-4">
      <ByokHeading configured={configured} />
      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        <li>
          Open{' '}
          <a
            href={AI_STUDIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary underline"
          >
            Google AI Studio
          </a>{' '}
          and create an API key.
        </li>
        <li>Paste the key below (we encrypt it at rest on the server).</li>
        <li>
          No test button — your first voice→draft parse is the connection test.
        </li>
      </ol>
      <label className="block space-y-1 text-sm">
        <span className="text-muted-foreground">Gemini API key</span>
        <div className="flex gap-2">
          <input
            type={showKey ? 'text' : 'password'}
            autoComplete="off"
            className="field-input flex-1 font-mono text-xs"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIza…"
          />
          <button
            type="button"
            className="rounded-lg border border-border px-3 text-xs"
            onClick={() => setShowKey((v) => !v)}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
      </label>
      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
        />
        <span className="text-muted-foreground">
          I am the account holder of this API key and accept Google&apos;s terms
          and any usage charges. Transcript text is sent to my chosen LLM via
          RupeeLens&apos;s proxy.
        </span>
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {message ? <p className="text-sm text-primary">{message}</p> : null}
      <button
        type="button"
        disabled={saving || !apiKey.trim()}
        onClick={() => void onSave()}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save key'}
      </button>
    </section>
  );
}

function ByokHeading({ configured }: { configured: boolean }) {
  return (
    <div>
      <h2 className="text-base font-semibold">Gemini API key (BYOK)</h2>
      <p className="text-sm text-muted-foreground">
        {configured
          ? 'A key is on file for this device.'
          : 'Required before AI draft parsing.'}
      </p>
    </div>
  );
}
