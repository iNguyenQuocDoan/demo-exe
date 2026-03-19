import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-border bg-transparent hover:bg-muted text-foreground",
        ghost:
          "hover:bg-muted text-foreground",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm:      "h-10 px-4 text-sm",
        lg:      "h-12 px-6 text-lg",
        icon:    "h-11 w-11",
        "icon-sm": "h-10 w-10",
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
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const cls = cn(buttonVariants({ variant, size, className }));
    if (asChild) {
      return (
        <Slot className={cls} ref={ref} {...props}>
          {children}
        </Slot>
      );
    }
    return (
      <button className={cls} ref={ref} disabled={disabled || loading} {...props}>
        <Loader2 className={cn("h-4 w-4 animate-spin", loading ? "inline-block" : "hidden")} />
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
