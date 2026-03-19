import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[hsl(221_83%_93%)] text-[hsl(221_83%_35%)]",
        secondary: "bg-[hsl(210_40%_96%)] text-[hsl(215_16%_40%)]",
        success: "bg-[hsl(142_71%_90%)] text-[hsl(142_71%_30%)]",
        warning: "bg-[hsl(38_92%_90%)] text-[hsl(38_92%_30%)]",
        destructive: "bg-[hsl(0_84%_93%)] text-[hsl(0_84%_40%)]",
        info: "bg-[hsl(186_84%_90%)] text-[hsl(186_84%_30%)]",
        outline: "border border-current",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
