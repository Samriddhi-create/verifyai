import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-sm px-2.5 text-sm font-semibold",
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-ink",
        secondary: "bg-surface-2 text-muted-foreground",
        outline: "border border-line-strong text-ink",
        supported: "bg-supported-soft text-supported-ink",
        partial: "bg-partial-soft text-partial-ink",
        contradicted: "bg-contradicted-soft text-contradicted-ink",
        unverified: "bg-unverified-soft text-unverified-ink",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
