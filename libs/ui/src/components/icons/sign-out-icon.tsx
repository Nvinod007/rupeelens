import { cn } from "../../lib/utils";

import { iconMotion } from "./motion";
import type { IconProps } from "./types";

export function SignOutIcon({
  animated = true,
  className,
  ...props
}: IconProps) {
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
      <path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
    </svg>
  );
}
