"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    compoundVariants: [
      {
        class:
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        color: "primary",
        variant: "solid",
      },
      {
        class:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        color: "secondary",
        variant: "solid",
      },
      {
        class:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        color: "destructive",
        variant: "solid",
      },
      {
        class: "border-primary bg-transparent text-primary hover:bg-primary/10",
        color: "primary",
        variant: "outline",
      },
      {
        class:
          "border-secondary bg-transparent text-secondary hover:bg-secondary/10",
        color: "secondary",
        variant: "outline",
      },
      {
        class:
          "border-destructive bg-transparent text-destructive hover:bg-destructive/10",
        color: "destructive",
        variant: "outline",
      },
      {
        class:
          "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
        color: "neutral",
        variant: "outline",
      },
      {
        class: "text-primary hover:bg-primary/10",
        color: "primary",
        variant: "ghost",
      },
      {
        class: "text-secondary hover:bg-secondary/10",
        color: "secondary",
        variant: "ghost",
      },
      {
        class: "text-destructive hover:bg-destructive/10",
        color: "destructive",
        variant: "ghost",
      },
      {
        class: "text-foreground hover:bg-accent hover:text-accent-foreground",
        color: "neutral",
        variant: "ghost",
      },
      {
        class: "text-primary underline-offset-4 hover:underline",
        color: "primary",
        variant: "link",
      },
      {
        class: "text-secondary underline-offset-4 hover:underline",
        color: "secondary",
        variant: "link",
      },
      {
        class: "text-destructive underline-offset-4 hover:underline",
        color: "destructive",
        variant: "link",
      },
    ],
    defaultVariants: {
      color: "primary",
      size: "default",
      variant: "solid",
    },
    variants: {
      color: {
        destructive: "",
        neutral: "",
        primary: "",
        secondary: "",
      },
      size: {
        default: "h-10 px-4 py-2",
        icon: "h-10 w-10",
        lg: "h-11 rounded-md px-8",
        sm: "h-9 rounded-md px-3",
      },
      variant: {
        ghost: "border border-transparent bg-transparent",
        link: "border border-transparent bg-transparent p-0 h-auto",
        outline: "border bg-transparent",
        solid: "border border-transparent",
      },
    },
  }
);

type ButtonFillVariant = NonNullable<
  VariantProps<typeof buttonVariants>["variant"]
>;
type ButtonColorVariant = NonNullable<
  VariantProps<typeof buttonVariants>["color"]
>;

/** @deprecated Use `solid` instead */
type LegacyButtonVariant = "default" | "secondary" | "destructive";

type ResolvedButtonVariants = {
  color: ButtonColorVariant;
  variant: ButtonFillVariant;
};

function resolveButtonVariants(
  variant?: ButtonFillVariant | LegacyButtonVariant | null,
  color?: ButtonColorVariant | null
): ResolvedButtonVariants {
  switch (variant) {
    case "default":
    case undefined:
    case null:
      return { color: color ?? "primary", variant: "solid" };
    case "secondary":
      return { color: "secondary", variant: "solid" };
    case "destructive":
      return { color: "destructive", variant: "solid" };
    case "outline":
      return { color: color ?? "neutral", variant: "outline" };
    case "ghost":
      return { color: color ?? "neutral", variant: "ghost" };
    case "link":
      return { color: color ?? "primary", variant: "link" };
    default:
      return { color: color ?? "primary", variant };
  }
}

export interface ButtonProps
  extends Omit<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      keyof VariantProps<typeof buttonVariants>
    >,
    Omit<VariantProps<typeof buttonVariants>, "color" | "variant"> {
  asChild?: boolean;
  color?: ButtonColorVariant;
  /** Fill style. Legacy values `default`, `secondary`, and `destructive` remain supported. */
  variant?: ButtonFillVariant | LegacyButtonVariant;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, color, size, asChild = false, ...props },
  ref
) {
  const resolved = resolveButtonVariants(variant, color);
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        buttonVariants({
          color: resolved.color,
          size,
          variant: resolved.variant,
        }),
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

export {
  Button,
  type ButtonColorVariant,
  type ButtonFillVariant,
  buttonVariants,
};
