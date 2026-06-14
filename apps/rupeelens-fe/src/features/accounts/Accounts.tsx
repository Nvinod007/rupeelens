import {
  BankIcon,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared-ui";

export function Accounts() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Accounts
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Link and manage your bank accounts via Account Aggregator.
        </p>
      </div>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Setu consent flow and account linking will land here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-secondary/10">
              <BankIcon animated={false} className="size-7 text-secondary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Mock placeholder — no backend calls yet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
