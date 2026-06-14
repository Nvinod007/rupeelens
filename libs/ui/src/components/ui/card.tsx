import { cn } from "@shared-ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const cardVariants = cva("border bg-card text-card-foreground", {
  defaultVariants: {
    size: "default",
    variant: "default",
  },
  variants: {
    size: {
      default: "rounded-lg",
      lg: "rounded-xl",
      sm: "rounded-md",
    },
    variant: {
      default: "border-border shadow-sm",
      elevated:
        "border-border/80 shadow-xl transition-shadow duration-300 hover:shadow-2xl",
      ghost: "border-transparent bg-transparent shadow-none",
      outline: "shadow-none",
    },
  },
});

const cardHeaderVariants = cva("flex flex-col space-y-1.5", {
  defaultVariants: {
    padding: "default",
  },
  variants: {
    padding: {
      default: "p-6",
      lg: "p-8",
      none: "p-0",
      sm: "p-4",
    },
  },
});

const cardTitleVariants = cva("font-semibold leading-none tracking-tight", {
  defaultVariants: {
    color: "default",
    size: "default",
  },
  variants: {
    color: {
      default: "text-card-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
    },
    size: {
      default: "text-2xl",
      lg: "text-3xl",
      sm: "text-lg",
    },
  },
});

const cardDescriptionVariants = cva("text-muted-foreground", {
  defaultVariants: {
    size: "default",
  },
  variants: {
    size: {
      default: "text-sm",
      lg: "text-base",
      sm: "text-xs",
    },
  },
});

const cardContentVariants = cva("", {
  defaultVariants: {
    padding: "default",
  },
  variants: {
    padding: {
      default: "p-6 pt-0",
      lg: "p-8 pt-0",
      none: "p-0",
      sm: "p-4 pt-0",
    },
  },
});

const cardFooterVariants = cva("flex items-center", {
  defaultVariants: {
    padding: "default",
  },
  variants: {
    padding: {
      default: "p-6 pt-0",
      lg: "p-8 pt-0",
      none: "p-0",
      sm: "p-4 pt-0",
    },
  },
});

export interface CardProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      keyof VariantProps<typeof cardVariants>
    >,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ size, variant }), className)}
      {...props}
    />
  )
);
Card.displayName = "Card";

export interface CardHeaderProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      keyof VariantProps<typeof cardHeaderVariants>
    >,
    VariantProps<typeof cardHeaderVariants> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ padding }), className)}
      {...props}
    />
  )
);
CardHeader.displayName = "CardHeader";

export interface CardTitleProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      keyof VariantProps<typeof cardTitleVariants>
    >,
    VariantProps<typeof cardTitleVariants> {}

const CardTitle = React.forwardRef<HTMLDivElement, CardTitleProps>(
  ({ className, color, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardTitleVariants({ color, size }), className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

export interface CardDescriptionProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      keyof VariantProps<typeof cardDescriptionVariants>
    >,
    VariantProps<typeof cardDescriptionVariants> {}

const CardDescription = React.forwardRef<HTMLDivElement, CardDescriptionProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardDescriptionVariants({ size }), className)}
      {...props}
    />
  )
);
CardDescription.displayName = "CardDescription";

export interface CardContentProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      keyof VariantProps<typeof cardContentVariants>
    >,
    VariantProps<typeof cardContentVariants> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ padding }), className)}
      {...props}
    />
  )
);
CardContent.displayName = "CardContent";

export interface CardFooterProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      keyof VariantProps<typeof cardFooterVariants>
    >,
    VariantProps<typeof cardFooterVariants> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ padding }), className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardContent,
  cardContentVariants,
  CardDescription,
  cardDescriptionVariants,
  CardFooter,
  cardFooterVariants,
  CardHeader,
  cardHeaderVariants,
  CardTitle,
  cardTitleVariants,
  cardVariants,
};
