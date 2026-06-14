import { cn } from "@shared-ui/lib";

import { iconMotion } from "./motion";
import type { IconProps } from "./types";

export function MonitorIcon({
  animated = true,
  className,
  ...props
}: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn(animated && iconMotion.monitor, className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height="14" rx="2" width="20" x="2" y="3" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
