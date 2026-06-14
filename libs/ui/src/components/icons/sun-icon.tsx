import { cn } from "@shared-ui/lib";

import { iconMotion } from "./motion";
import type { IconProps } from "./types";

export function SunIcon({ animated = true, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn(animated && iconMotion.sun, className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}
