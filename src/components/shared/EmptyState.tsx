import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";
import { AppIcon } from "../ui/icon";

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
      {/* Empty state: một icon đơn giản, không container pastel/gradient orb. */}
      {Icon && <AppIcon icon={Icon} size="empty" tone="muted" className="relative mb-4" />}
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
