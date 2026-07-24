import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * EmptyStateInline — compact empty state for use inside list/table containers.
 * Replaces the tall EmptyState (py-20) when content area is small.
 */
export function EmptyStateInline({
  icon: Icon,
  title,
  description,
  primaryCTA,
  secondaryCTA,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  primaryCTA?: { label: string; onClick: () => void };
  secondaryCTA?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 py-10 px-6 text-center",
        className,
      )}
    >
      {Icon && <AppIcon icon={Icon} size="empty" tone="muted" />}
      <div className="max-w-xs space-y-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {(primaryCTA ?? secondaryCTA) && (
        <div className="flex flex-wrap justify-center gap-2">
          {primaryCTA && (
            <Button size="sm" onClick={primaryCTA.onClick}>
              {primaryCTA.label}
            </Button>
          )}
          {secondaryCTA && (
            <Button size="sm" variant="outline" onClick={secondaryCTA.onClick}>
              {secondaryCTA.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
