import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "surface-card relative flex min-h-96 flex-col items-center justify-center overflow-hidden px-6 py-16 text-center",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(37,99,235,0.08),transparent)]" />
      {Icon && (
        <div className="relative mb-5 flex h-18 w-18 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
          <Icon className="h-9 w-9 text-primary" />
        </div>
      )}
      <h3 className="relative mb-2 text-xl font-bold text-foreground">{title}</h3>
      {description && (
        <p className="relative mb-5 max-w-md text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && (
        <Button className="relative" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
