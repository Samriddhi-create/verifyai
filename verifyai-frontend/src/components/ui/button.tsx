import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-[15px] font-semibold no-underline transition-colors disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "bg-violet text-violet-on shadow-glow-button hover:brightness-110",
        secondary: "bg-surface-2 text-ink hover:border-line-strong",
        outline: "border-line-strong bg-transparent text-ink hover:bg-surface-2",
        ghost: "text-muted-foreground hover:bg-surface-2 hover:text-ink",
        link: "h-auto px-0 text-violet underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-[18px]",
        sm: "h-11 px-3.5 text-sm",
        lg: "h-12 px-6",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
