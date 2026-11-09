import type { HTMLAttributes } from 'react';

import { cn } from '../../lib/utils';

/** Shimmering placeholder block. Size and shape come from `className`. */
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        'animate-shimmer rounded-md bg-[length:200%_100%] bg-gradient-to-r from-muted via-foreground/10 to-muted',
        className
      )}
      {...props}
    />
  );
}
