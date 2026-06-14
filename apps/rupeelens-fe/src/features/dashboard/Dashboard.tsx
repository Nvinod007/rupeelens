import {
  BankIcon,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  RupeeIcon,
} from "@shared-ui";
import Link from "next/link";

import { DashboardGreeting } from "./DashboardGreeting";

const MOCK_SUMMARY_CARDS = [
  {
    description: "Across all linked accounts",
    label: "Total balance",
    value: "₹1,24,580",
  },
  {
    description: "June 2026 so far",
    label: "Monthly spend",
    value: "₹42,350",
  },
  {
    description: "HDFC, ICICI, SBI",
    label: "Accounts linked",
    value: "3",
  },
] as const;

export function Dashboard() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <DashboardGreeting />

      <section
        aria-label="Financial summary"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {MOCK_SUMMARY_CARDS.map((card) => (
          <Card key={card.label} variant="elevated">
            <CardHeader padding="sm">
              <CardDescription size="sm">{card.label}</CardDescription>
              <CardTitle size="lg">{card.value}</CardTitle>
            </CardHeader>
            <CardContent padding="sm">
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card variant="outline">
        <CardHeader>
          <CardTitle size="default">Recent activity</CardTitle>
          <CardDescription>
            Your latest transactions will appear here once accounts are synced.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
              <RupeeIcon animated={false} className="size-7 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="font-medium">No recent transactions yet</p>
              <p className="text-sm text-muted-foreground">
                Link a bank account to start tracking your UPI and card activity
                in one place.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild color="primary" variant="solid">
                <Link href="/accounts">
                  <BankIcon animated={false} className="size-4" />
                  Link account
                </Link>
              </Button>
              <Button asChild color="primary" variant="outline">
                <Link href="/transactions">View transactions</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
