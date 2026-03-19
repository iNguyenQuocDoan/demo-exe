import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyStateInline } from "@/components/shared/EmptyStateInline";

export interface ActionItem {
  id: string;
  title: string;
  subtitle?: string;
  /** e.g. "Chờ duyệt", "Cần xử lý" */
  badge?: string;
  /** Accent: warning | destructive | default */
  badgeVariant?: "warning" | "destructive" | "default";
  href?: string;
  onPrimary?: () => void;
  primaryLabel?: string;
  onSecondary?: () => void;
  secondaryLabel?: string;
}

/**
 * DashboardActionPanel — "Việc cần làm" block for dashboards.
 * Appears above-the-fold. Shows pending bookings / applications / payments
 * that require user action.
 */
export function DashboardActionPanel({
  title = "Cần xử lý",
  items,
  isLoading,
  viewAllHref,
  emptyTitle = "Không có việc cần xử lý",
  emptyDescription = "Tất cả đã được xử lý.",
}: {
  title?: string;
  items: ActionItem[];
  isLoading: boolean;
  viewAllHref?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <div className="surface-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-warning" />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {!isLoading && items.length > 0 && (
            <Badge variant="warning" className="text-xs">
              {items.length}
            </Badge>
          )}
        </div>
        {viewAllHref && (
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2">
            <Link href={viewAllHref}>Xem tất cả →</Link>
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyStateInline
          title={emptyTitle}
          description={emptyDescription}
          className="py-8"
        />
      ) : (
        <div className="divide-y divide-border">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="truncate text-xs text-muted-foreground">
                    {item.subtitle}
                  </p>
                )}
                {item.badge && (
                  <Badge
                    variant={item.badgeVariant ?? "warning"}
                    className="mt-1 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </div>
              <div className="flex shrink-0 gap-2">
                {item.onPrimary && item.primaryLabel && (
                  <Button size="sm" className="h-8" onClick={item.onPrimary}>
                    {item.primaryLabel}
                  </Button>
                )}
                {item.onSecondary && item.secondaryLabel && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8"
                    onClick={item.onSecondary}
                  >
                    {item.secondaryLabel}
                  </Button>
                )}
                {item.href && !item.onPrimary && (
                  <Button asChild size="sm" variant="outline" className="h-8">
                    <Link href={item.href}>Chi tiết</Link>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
