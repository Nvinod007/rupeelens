import { cn } from "@shared-ui/lib";

import { iconMotion } from "./motion";
import type { IconProps } from "./types";

export function MoonIcon({ animated = true, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn(animated && iconMotion.moon, className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
