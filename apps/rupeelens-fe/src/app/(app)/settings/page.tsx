import { AccountCard } from '@/components/settings/AccountCard';
import { ByokForm } from '@/components/settings/ByokForm';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          API key, account, and legal.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <AccountCard />
          <ByokForm />
        </div>
        <LegalSupportSection />
      </div>
    </div>
  );
}

function LegalSupportSection() {
  return (
    <section className="glass-card space-y-3 p-4 text-sm">
      <h2 className="text-base font-semibold">Support & legal</h2>
      <p className="text-muted-foreground">
        Support:{' '}
        <a className="text-secondary underline" href="mailto:hello@rupeelens.appkits.in">
          hello@rupeelens.appkits.in
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
