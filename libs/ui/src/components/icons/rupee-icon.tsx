import { cn } from "@shared-ui/lib";

import { iconMotion } from "./motion";
import type { IconProps } from "./types";

export function RupeeIcon({ animated = true, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn(animated && iconMotion.rupee, className)}
      fill="currentColor"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M6 3h12v2H9.5l-.5 2H17v2h-5.5L11 11h6v2H8.5l-1 4H18v2H6v-2h5.5l1-4H8v-2h5.5l.5-2H6V3z" />
    </svg>
  );
}
