import { cn } from "@shared-ui/lib";

import { iconMotion } from "./motion";
import type { IconProps } from "./types";

export function LockIcon({ animated = true, className, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn(animated && iconMotion.lock, className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.75}
      viewBox="0 0 24 24"
      {...props}
    >
      <rect height={10} rx={2} width={14} x={5} y={11} />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}
