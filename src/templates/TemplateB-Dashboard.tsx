/**
 * TEMPLATE B — Dashboard Page (Workspace)
 * ─────────────────────────────────────────────────────────────
 * Use for: /dashboard/parent, /dashboard/tutor, /dashboard/admin
 *
 * Above-the-fold structure (NO scroll needed):
 *   [H1 + subtext]
 *   [ActionPanel — "Cần xử lý"] │ [UpcomingPanel — "Lịch sắp tới"]
 *   ── user scrolls for KPI row + sections below ──
 *
 * Key rules:
 *   • NO landing hero / greeting card
 *   • Action + Upcoming MUST be above-the-fold
 *   • KPI cards come AFTER, not before, the action panels
 *   • Empty states in panels are inline (not full-height)
 *   • Skeleton for every async block
 *
 * COPY THIS FILE → rename → replace TODO markers → delete this header.
 * ─────────────────────────────────────────────────────────────
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Calendar, Star, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCardCompact } from "@/components/shared/KpiCardCompact";
import { DashboardActionPanel, type ActionItem } from "@/components/shared/DashboardActionPanel";
import { DashboardUpcomingPanel, type UpcomingEvent } from "@/components/shared/DashboardUpcomingPanel";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Skeleton } from "@/components/ui/skeleton";

// ── TODO: replace with real data types + API calls ─────────────
async function fetchDashboardData(): Promise<{
  pendingItems: ActionItem[];
  upcomingEvents: UpcomingEvent[];
  kpi: { label: string; value: string | number }[];
}> {
  // MOCK — replace with real API calls
  return {
    pendingItems: [],
    upcomingEvents: [],
    kpi: [
      { label: "Buổi học", value: "0" },
      { label: "Đã xác nhận", value: "0" },
      { label: "Chờ duyệt", value: "0" },
      { label: "Thu nhập tháng", value: "0 ₫" },
    ],
  };
}

const KPI_ICONS = [BookOpen, Calendar, Star, Wallet];
const KPI_COLORS = ["text-primary", "text-success", "text-warning", "text-accent"];
const KPI_BG    = ["bg-primary/10", "bg-success/10", "bg-warning/10", "bg-accent/10"];

export default function TemplateBDashboardPage() {
  const [data, setData]         = useState<Awaited<ReturnType<typeof fetchDashboardData>> | null>(null);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchDashboardData();
      setData(result);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <main className="min-h-dvh bg-[var(--bg-app)]">
      <PageAnimations />

      <section className="pt-4 pb-8">
        <div className="site-container space-y-4">

          {/* ── B1: Compact page header (no greeting card) ──────── */}
          <div className="flex items-center justify-between gap-3">
            <div>
              {/* TODO: replace title + subtitle for each role */}
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Tổng quan hoạt động của bạn hôm nay
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* TODO: add role-specific quick action buttons */}
              <Button variant="outline" size="sm">Xem lịch</Button>
            </div>
          </div>

          {/* ── B2: Above-the-fold — Action + Upcoming (2 cols) ─── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DashboardActionPanel
              title="Cần xử lý"
              items={data?.pendingItems ?? []}
              isLoading={loading}
              viewAllHref="/tutor/bookings"           /* TODO: role-specific href */
              emptyTitle="Không có việc cần xử lý"
              emptyDescription="Mọi yêu cầu đã được xử lý."
            />
            <DashboardUpcomingPanel
              title="Lịch sắp tới"
              events={data?.upcomingEvents ?? []}
              isLoading={loading}
              viewAllHref="/tutor/schedule"           /* TODO: role-specific href */
              emptyTitle="Chưa có lịch"
              emptyDescription="Các buổi học sắp tới sẽ xuất hiện ở đây."
              emptyCTA={{ label: "Tìm gia sư", href: "/tutors" }} /* TODO: tutor: remove; parent: keep */
            />
          </div>

          {/* ── B3: KPI row (below action panels) ───────────────── */}
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="surface-card p-4 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-16" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(data?.kpi ?? []).map((card, i) => (
                <KpiCardCompact
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  icon={KPI_ICONS[i]}
                  iconColor={KPI_COLORS[i]}
                  iconBg={KPI_BG[i]}
                  href={/* TODO: link to relevant list page */ undefined}
                />
              ))}
            </div>
          )}

          {/* ── B4: Role-specific sections (below the fold) ─────── */}
          {/* TODO: add role-specific content sections here.
              Each section follows:
                <SectionHeader title="..." viewAllHref="..." />
                <SectionContent /> or <EmptyStateInline />
          */}

        </div>
      </section>
    </main>
  );
}
