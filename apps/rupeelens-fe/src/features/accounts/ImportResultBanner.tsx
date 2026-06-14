import Link from "next/link";

export function ImportResultBanner({ message }: { message: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-primary">{message}</p>
      <Link
        className="text-sm text-secondary underline-offset-4 hover:underline"
        href="/transactions"
      >
        View transactions →
      </Link>
    </div>
  );
}
