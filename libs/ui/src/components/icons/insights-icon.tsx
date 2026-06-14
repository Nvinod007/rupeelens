import { cn } from "@shared-ui/lib";

import { iconMotion } from "./motion";
import type { IconProps } from "./types";

export function InsightsIcon({
  animated = true,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn(animated && iconMotion.insights, className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      {...props}
    >
      <path d="M4 19V5M10 19V9M16 19v-6M22 19V3" />
    </svg>
  );
}
