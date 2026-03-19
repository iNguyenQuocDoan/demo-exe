import Link from "next/link";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * KpiCardCompact — compact, click-through KPI card.
 * Use in dashboard rows where vertical space matters.
 * Wrap in a 2- or 4-col grid.
 */
export function KpiCardCompact({
  label,
  value,
  icon: Icon,
  href,
  trend,
  iconColor = "text-primary",
  iconBg = "bg-primary/10",
  className,
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  href?: string;
  /** Trend relative to previous period */
  trend?: { value: number; direction: "up" | "down" };
  iconColor?: string;
  iconBg?: string;
  className?: string;
}) {
  const body = (
    <div
      className={cn(
        "surface-card flex items-start justify-between gap-3 p-4",
        href && "cursor-pointer transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        {trend && (
          <div
            className={cn(
              "mt-1 flex items-center gap-1 text-xs font-medium",
              trend.direction === "up" ? "text-success" : "text-destructive",
            )}
          >
            {trend.direction === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      {Icon && (
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            iconBg,
          )}
        >
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      )}
    </div>
  );

  if (href)
    return (
      <Link href={href} className="block">
        {body}
      </Link>
    );
  return body;
}
