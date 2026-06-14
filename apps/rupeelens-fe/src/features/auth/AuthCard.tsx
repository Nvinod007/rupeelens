import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@shared-ui";
import Image from "next/image";
import type { ReactNode } from "react";

type AuthCardProps = {
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthCard({ children, footer }: AuthCardProps) {
  return (
    <>
      <Card size="lg" variant="elevated">
        <CardHeader className="items-center space-y-4 pb-2 text-center">
          <Image
            alt="RupeeLens"
            className="size-16 rounded-xl object-cover shadow-[0_0_24px_hsl(var(--primary)/0.2)]"
            height={64}
            priority
            src="/rupeelens-icon.png"
            unoptimized
            width={64}
          />
          <div className="space-y-1">
            <CardTitle
              className="font-semibold tracking-tight dark:text-primary"
              size="default"
            >
              RupeeLens
            </CardTitle>
            <CardDescription size="lg">Track. Analyze. Plan.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">{children}</CardContent>
      </Card>
      {footer ? <div className="mt-6 text-center">{footer}</div> : null}
    </>
  );
}
