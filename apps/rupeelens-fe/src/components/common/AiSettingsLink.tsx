import Link from 'next/link';

/**
 * Shown under any AI failure. Opens Settings in a new tab so a half-written
 * note or form in the current sheet is never lost.
 */
export function AiSettingsLink({ className }: { className?: string }) {
  return (
    <Link
      className={`text-secondary underline underline-offset-2 ${className ?? ''}`}
      href="/settings"
      rel="noopener"
      target="_blank"
    >
      Check your API key in Settings
    </Link>
  );
}
