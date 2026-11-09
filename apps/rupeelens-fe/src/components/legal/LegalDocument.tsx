import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { LEGAL, LEGAL_ROUTES } from '@/lib/legal';

type LegalPageProps = {
  title: string;
  /** The other legal document, linked in the footer. */
  sibling: 'privacy' | 'terms';
  children: ReactNode;
};

export function LegalPage({ title, sibling, children }: LegalPageProps) {
  const siblingLabel = sibling === 'privacy' ? 'Privacy Policy' : 'Terms of Service';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link className="flex items-center gap-2.5" href="/login">
            <Image
              alt={LEGAL.productName}
              className="size-9 rounded-lg"
              height={36}
              src="/rupeelens-icon.png"
              width={36}
            />
            <span className="text-sm font-semibold">{LEGAL.productName}</span>
          </Link>
          <Link className="text-sm text-muted-foreground hover:text-primary" href="/login">
            ← Back to sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Effective {LEGAL.effectiveDate} · Applies to {LEGAL.domain}
        </p>
        <div className="mt-8 space-y-8">{children}</div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground">
          <span>© {LEGAL.productName}</span>
          <Link className="hover:text-primary" href={LEGAL_ROUTES[sibling]}>
            {siblingLabel}
          </Link>
        </div>
      </footer>
    </div>
  );
}

export function Section({
  id,
  n,
  title,
  children,
}: {
  id: string;
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="scroll-mt-20 space-y-3">
      <h2 className="text-lg font-semibold" id={id}>
        {n}. {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p>{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul className="list-disc space-y-1.5 pl-5">{children}</ul>;
}

export function B({ children }: { children: ReactNode }) {
  return <strong className="font-medium text-foreground">{children}</strong>;
}

export function ContactBlock() {
  return (
    <P>
      Email{' '}
      <a className="text-primary underline underline-offset-2" href={`mailto:${LEGAL.contactEmail}`}>
        {LEGAL.contactEmail}
      </a>
      {LEGAL.registeredAddress ? <> · {LEGAL.registeredAddress}</> : null}
    </P>
  );
}
