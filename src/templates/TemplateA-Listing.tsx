/**
 * TEMPLATE A — Listing Page
 * ─────────────────────────────────────────────────────────────
 * Use for: /tutors, /parent/bookings, /tutor/bookings,
 *          /admin/bookings, /admin/applications, /admin/users, /tutor/reviews
 *
 * Above-the-fold structure (no scroll needed):
 *   [H1 + subtext]  [filter bar]  [list/grid — first 2 items visible]
 *
 * COPY THIS FILE → rename → replace TODO markers → delete this header.
 * ─────────────────────────────────────────────────────────────
 */
"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Search, ServerOff } from "lucide-react";
import { FilterBarCompact } from "@/components/shared/FilterBarCompact";
import { AdvancedFiltersSheet } from "@/components/shared/AdvancedFiltersSheet";
import { SkeletonGrid } from "@/components/shared/SkeletonGrid";   // or SkeletonList / SkeletonTable
import { EmptyStateInline } from "@/components/shared/EmptyStateInline";
import { PageAnimations } from "@/components/animations/PageAnimations";

// ── TODO: replace with your real item type ──────────────────────
type Item = { id: string; name: string };

// ── TODO: replace with your real fetch function ─────────────────
async function fetchItems(_filter: Record<string, string>): Promise<Item[]> {
  return [];
}

export default function TemplateAListingPage() {
  const [items, setItems]         = useState<Item[] | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [retryKey, setRetryKey]   = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [searchValue, setSearchValue]   = useState("");
  const [isPending, startTransition]    = useTransition();

  // ── TODO: replace filter shape with your real filter state ───
  const [filter] = useState<Record<string, string>>({});

  // Fetch on filter / retryKey change
  useEffect(() => {
    let active = true;
    setFetchError(false);
    startTransition(() => {
      void fetchItems(filter).then((data) => {
        if (!active) return;
        setItems(data);
      }).catch(() => {
        if (!active) return;
        setItems([]);
        setFetchError(true);
      });
    });
    return () => { active = false; };
  }, [filter, retryKey]);

  // Client-side keyword filter
  const filtered = useMemo(() => {
    if (!items) return [];
    if (!searchValue.trim()) return items;
    const q = searchValue.toLowerCase();
    return items.filter((item) => item.name.toLowerCase().includes(q));
  }, [items, searchValue]);

  const loading = items === null || isPending;

  return (
    <main className="min-h-dvh bg-[var(--bg-app)]">
      <PageAnimations />

      <section className="pt-4 pb-8">
        <div className="site-container space-y-3">

          {/* ── A1: Compact header ─────────────────────────────── */}
          <div className="flex items-center justify-between gap-2">
            {/* TODO: replace page title */}
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Tên trang
            </h1>
            <span className="text-sm text-muted-foreground">
              {loading ? "Đang tải..." : `${filtered.length} kết quả`}
            </span>
          </div>

          {/* ── A2: Compact filter bar (always visible) ─────────── */}
          <FilterBarCompact
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            summary={/* TODO: filter summary string */ ""}
            activeCount={/* TODO: count of active advanced filters */ 0}
            onOpenAdvanced={() => setAdvancedOpen(true)}
            onSubmit={() => {/* optional: trigger search */ }}
          />

          {/* ── A3: Advanced filters sheet (opens on demand) ────── */}
          <AdvancedFiltersSheet
            open={advancedOpen}
            onOpenChange={setAdvancedOpen}
            title="Bộ lọc nâng cao"
            description="Tinh chỉnh kết quả tìm kiếm."
            onApply={() => setAdvancedOpen(false)}
            onReset={() => {/* TODO: reset filter state */ }}
          >
            {/* TODO: put your filter fields here */}
            <p className="text-sm text-muted-foreground">Chưa có bộ lọc.</p>
          </AdvancedFiltersSheet>

          {/* ── A4: Content area ──────────────────────────────────
               Loading  → skeleton (at least 2 items visible)
               Error    → error empty state
               Empty    → empty state with CTA
               Data     → list / grid / table              ────── */}
          {loading ? (
            <SkeletonGrid count={4} />
            /* Use <SkeletonList rows={5} /> for list layout    */
            /* Use <SkeletonTable rows={5} cols={4} /> for table */
          ) : fetchError ? (
            <div className="surface-card">
              <EmptyStateInline
                icon={ServerOff}
                title="Không thể kết nối máy chủ"
                description="Vui lòng kiểm tra kết nối hoặc thử lại sau."
                primaryCTA={{
                  label: "Thử lại",
                  onClick: () => { setItems(null); setRetryKey((k) => k + 1); },
                }}
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="surface-card">
              <EmptyStateInline
                icon={Search}
                title="Không tìm thấy kết quả"
                description="Thử thay đổi từ khóa hoặc bộ lọc."
                primaryCTA={{ label: "Xóa bộ lọc", onClick: () => setSearchValue("") }}
              />
            </div>
          ) : (
            /* TODO: replace with your real list/grid/table */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {filtered.map((item) => (
                <div key={item.id} className="surface-card p-5">
                  {item.name}
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
