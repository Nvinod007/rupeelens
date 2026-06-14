import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InsightsIcon,
} from "@shared-ui";

export function Insights() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Insights
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Spending trends, categories, and smart summaries.
        </p>
      </div>

      <Card variant="outline">
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Category breakdowns and monthly trends will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
              <InsightsIcon
                animated={false}
                className="size-7 text-destructive"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Mock placeholder — static insights UI in a future release.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
