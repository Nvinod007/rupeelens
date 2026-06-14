"use client";

import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@shared-ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const separatorVariants = cva("shrink-0", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "bg-border",
      muted: "bg-border/50",
      primary: "bg-primary/30",
    },
  },
});

export interface SeparatorProps
  extends React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>,
    VariantProps<typeof separatorVariants> {}

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  SeparatorProps
>(
  (
    {
      className,
      orientation = "horizontal",
      decorative = true,
      variant,
      ...props
    },
    ref
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        separatorVariants({ variant }),
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      {...props}
    />
  )
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator, separatorVariants };
