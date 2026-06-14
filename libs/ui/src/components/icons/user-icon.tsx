import { cn } from "@shared-ui/lib";

import { iconMotion } from "./motion";
import type { IconProps } from "./types";

export function UserIcon({ animated = true, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn(animated && iconMotion.user, className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
