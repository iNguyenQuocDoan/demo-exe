/**
 * TEMPLATE C — Detail Page
 * ─────────────────────────────────────────────────────────────
 * Use for: /tutors/[id], /parent/bookings/[id], /tutor/bookings/[id],
 *          /tutor/profile, /parent/profile
 *
 * Above-the-fold structure:
 *   [Back link + H1]
 *   [Summary card — key info, compact, 1-2 rows max]
 *   [Primary action buttons]
 *   ── user scrolls for detail sections ──
 *
 * Key rules:
 *   • Summary card: compact (p-4~p-5), shows only the most critical info
 *   • Status badge always visible in summary
 *   • No section rỗng — empty section = EmptyStateInline with CTA
 *   • Section headers are small (text-sm font-semibold), not h2 hero-style
 *
 * COPY THIS FILE → rename → replace TODO markers → delete this header.
 * ─────────────────────────────────────────────────────────────
 */
"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyStateInline } from "@/components/shared/EmptyStateInline";

// ── TODO: replace with real data type + API call ───────────────
type DetailItem = {
  id: string;
  title: string;
  status: string;
  statusVariant: "default" | "success" | "warning" | "destructive" | "secondary";
  // ... other fields
};

async function fetchDetail(_id: string): Promise<DetailItem | null> {
  return null; // MOCK — replace with real API
}

export default function TemplateCDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [item, setItem]       = useState<DetailItem | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchDetail(params.id).then((data) => {
      setItem(data);
      setLoading(false);
    });
  }, [params.id]);

  return (
    <main className="min-h-dvh bg-[var(--bg-app)]">
      <section className="pt-4 pb-8">
        <div className="site-container max-w-4xl space-y-4">

          {/* ── C1: Back link + page title ───────────────────────── */}
          <div className="flex items-center gap-3">
            {/* TODO: replace back href */}
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 px-2">
              <Link href="/parent/bookings">
                <ArrowLeft className="h-3.5 w-3.5" />
                Quay lại
              </Link>
            </Button>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {/* TODO: replace page title */}
              Chi tiết
            </h1>
          </div>

          {/* ── C2: Summary card (compact) ───────────────────────── */}
          {loading ? (
            <div className="surface-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ) : !item ? (
            <div className="surface-card">
              <EmptyStateInline
                title="Không tìm thấy dữ liệu"
                description="Mục này có thể đã bị xóa hoặc bạn không có quyền xem."
                primaryCTA={{ label: "Quay lại", onClick: () => history.back() }}
              />
            </div>
          ) : (
            <div className="surface-card p-5">
              {/* Title + status badge in one row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-foreground">{item.title}</h2>
                <Badge variant={item.statusVariant}>{item.status}</Badge>
              </div>

              {/* TODO: Add key info fields in a compact grid */}
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                {/* Example field: */}
                <div>
                  <p className="text-xs text-muted-foreground">Trường thông tin</p>
                  <p className="font-medium text-foreground">Giá trị</p>
                </div>
              </div>

              {/* Primary actions */}
              <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                {/* TODO: replace with role-specific actions */}
                <Button size="sm">Hành động chính</Button>
                <Button size="sm" variant="outline">Hành động phụ</Button>
              </div>
            </div>
          )}

          {/* ── C3: Detail sections (below the fold) ─────────────── */}
          {/* Each section: header + content. If empty → EmptyStateInline */}
          {item && (
            <>
              {/* Section example */}
              <div className="surface-card overflow-hidden">
                <div className="border-b border-border px-5 py-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    {/* TODO: section title */}
                    Thông tin chi tiết
                  </h3>
                </div>
                <div className="p-5">
                  {/* TODO: section content or EmptyStateInline */}
                  <EmptyStateInline
                    title="Chưa có dữ liệu"
                    description="Thông tin sẽ xuất hiện sau khi được cập nhật."
                  />
                </div>
              </div>
            </>
          )}

        </div>
      </section>
    </main>
  );
}
