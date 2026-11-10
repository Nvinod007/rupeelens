import { SignOutButton } from '@/components/app-shell/SignOutButton';
import { CategoriesCard } from '@/components/settings/CategoriesCard';
import { ByokForm } from '@/components/settings/ByokForm';

import { SUPPORT_EMAIL } from '@/lib/legal';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          API key and categories.
        </p>
      </div>

      <div className="mx-auto max-w-xl space-y-4">
        <ByokForm />
        <CategoriesCard />
      </div>

      <div className="mx-auto max-w-xl md:hidden">
        <SignOutButton className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-500/30 px-4 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400" />
      </div>

      <LegalSupportSection />
    </div>
  );
}

function LegalSupportSection() {
  return (
    <section className="glass-card mx-auto max-w-xl space-y-3 border-t border-border p-4 pt-6 text-sm">
      <h2 className="text-base font-semibold">Support & legal</h2>
      <p className="text-muted-foreground">
        Support:{' '}
        <a className="text-secondary underline" href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
      </p>
      <p className="text-muted-foreground">
        Mic and Web Speech may send audio to your browser vendor for recognition.
        RupeeLens is not responsible for provider bills, quotas, or account bans.
      </p>
      <div className="flex flex-wrap gap-4 pt-1">
        <a className="text-secondary underline" href="/privacy">
          Privacy
        </a>
        <a className="text-secondary underline" href="/terms">
          Terms
        </a>
      </div>
      <p className="text-xs text-muted-foreground">18+ where required by law.</p>
    </section>
  );
}
