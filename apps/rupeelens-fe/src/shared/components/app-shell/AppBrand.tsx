import { cn } from "@shared-ui";
import Image from "next/image";
import Link from "next/link";

type AppBrandProps = {
  className?: string;
};

export function AppBrand({ className }: AppBrandProps) {
  return (
    <Link className={cn("flex items-center gap-2.5", className)} href="/">
      <Image
        alt="RupeeLens"
        className="size-9 shrink-0 rounded-lg"
        height={36}
        priority
        src="/rupeelens-icon.png"
        width={36}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold leading-none">RupeeLens</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          Track. Analyze. Plan.
        </p>
      </div>
    </Link>
  );
}
