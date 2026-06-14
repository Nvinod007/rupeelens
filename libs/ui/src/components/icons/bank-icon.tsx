import { cn } from "@shared-ui/lib";

import { iconMotion } from "./motion";
import type { IconProps } from "./types";

export function BankIcon({ animated = true, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn(animated && iconMotion.bank, className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M3 10h18M5 10V19M9 10V19M15 10V19M19 10V19M4 19h16M12 3l8 5H4l8-5z" />
    </svg>
  );
}
