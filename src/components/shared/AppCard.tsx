import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const CARD_TOKENS = {
  base: "rounded-2xl border border-border bg-card shadow-sm transition-all",
  elevated: "hover:shadow-md hover:shadow-primary/10",
  content: "p-4 sm:p-5 lg:p-6",
  title: "text-xl font-semibold text-foreground",
  meta: "text-sm leading-relaxed text-muted-foreground",
  avatar: "h-12 w-12 lg:h-14 lg:w-14",
  cta: "h-11 min-h-11 text-sm font-semibold",
} as const;

export function AppCard({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <Card className={cn(CARD_TOKENS.base, CARD_TOKENS.elevated, className)}>{children}</Card>;
}
