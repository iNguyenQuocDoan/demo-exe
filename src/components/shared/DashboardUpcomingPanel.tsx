import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyStateInline } from "@/components/shared/EmptyStateInline";

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:MM"
  endTime?: string;   // "HH:MM"
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "secondary";
  href?: string;
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().split("T")[0];
}

function isTomorrow(dateStr: string) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return dateStr === d.toISOString().split("T")[0];
}

function formatEventDate(dateStr: string) {
  if (isToday(dateStr)) return "Hôm nay";
  if (isTomorrow(dateStr)) return "Ngày mai";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(dateStr + "T00:00:00"));
}

/**
 * DashboardUpcomingPanel — "Lịch sắp tới" block for dashboards.
 * Shows today/upcoming scheduled events/bookings.
 */
export function DashboardUpcomingPanel({
  title = "Lịch sắp tới",
  events,
  isLoading,
  viewAllHref,
  emptyTitle = "Không có lịch sắp tới",
  emptyDescription = "Chưa có buổi học nào được xếp lịch.",
  emptyCTA,
}: {
  title?: string;
  events: UpcomingEvent[];
  isLoading: boolean;
  viewAllHref?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyCTA?: { label: string; href: string };
}) {
  const todayCount = events.filter((e) => isToday(e.date)).length;

  return (
    <div className="surface-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          {!isLoading && todayCount > 0 && (
            <Badge variant="default" className="text-xs">
              {todayCount} hôm nay
            </Badge>
          )}
        </div>
        {viewAllHref && (
          <Button asChild variant="ghost" size="sm" className="h-7 text-xs px-2">
            <Link href={viewAllHref} className="inline-flex items-center gap-1">
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="divide-y divide-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 px-5 py-4">
              <Skeleton className="mt-0.5 h-9 w-14 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <EmptyStateInline
          icon={CalendarDays}
          title={emptyTitle}
          description={emptyDescription}
          className="py-8"
          primaryCTA={
            emptyCTA
              ? { label: emptyCTA.label, onClick: () => { window.location.href = emptyCTA.href; } }
              : undefined
          }
        />
      ) : (
        <div className="divide-y divide-border">
          {events.map((evt) => {
            const dateLabel = formatEventDate(evt.date);
            const isEvtToday = isToday(evt.date);
            const row = (
              <div
                key={evt.id}
                className={`flex items-start gap-3 px-5 py-4 ${evt.href ? "cursor-pointer hover:bg-muted/40 transition-colors" : ""}`}
              >
                {/* Date chip */}
                <div
                  className={`flex w-14 shrink-0 flex-col items-center justify-center rounded-lg py-1.5 text-center ${
                    isEvtToday
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="text-[10px] font-medium leading-tight">
                    {dateLabel}
                  </span>
                  <span className="mt-0.5 flex items-center gap-0.5 text-xs font-semibold leading-tight">
                    <Clock className="h-2.5 w-2.5" />
                    {evt.startTime}
                  </span>
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {evt.title}
                  </p>
                  {evt.endTime && (
                    <p className="text-xs text-muted-foreground">
                      {evt.startTime} – {evt.endTime}
                    </p>
                  )}
                  {evt.badge && (
                    <Badge
                      variant={evt.badgeVariant ?? "secondary"}
                      className="mt-1 text-xs"
                    >
                      {evt.badge}
                    </Badge>
                  )}
                </div>
              </div>
            );

            return evt.href ? (
              <Link key={evt.id} href={evt.href} className="block">
                {row}
              </Link>
            ) : (
              <div key={evt.id}>{row}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
