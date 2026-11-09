import Image from 'next/image';
import Link from 'next/link';

type AppBrandProps = {
  compact?: boolean;
};

export function AppBrand({ compact = false }: AppBrandProps) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <Image
        alt="RupeeLens"
        className="size-10 shrink-0 rounded-xl"
        height={40}
        priority
        src="/rupeelens-icon.png"
        width={40}
      />
      {!compact ? (
        <span>
          <span className="block text-base font-semibold leading-tight tracking-tight">
            RupeeLens
          </span>
          <span className="block text-xs text-muted-foreground">
            Track. Analyze. Plan.
          </span>
        </span>
      ) : null}
    </Link>
  );
}
