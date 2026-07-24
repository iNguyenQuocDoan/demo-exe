"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ServerOff,
  Users,
} from "lucide-react";
import { getTutors } from "@/api/tutorApi";
import { getDistrictMap, getSubjectMap } from "@/api/referenceApi";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { TutorFilter } from "@/components/shared/TutorFilter";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { useFilterStore } from "@/store/useFilterStore";
import type { TutorProfile } from "@/types";
import { FilterBarCompact } from "@/components/shared/FilterBarCompact";
import { AdvancedFiltersSheet } from "@/components/shared/AdvancedFiltersSheet";
import { SkeletonGrid } from "@/components/shared/SkeletonGrid";
import { TutorList } from "@/components/shared/TutorList";

const PAGE_SIZE = 8;
const MAX_VISIBLE_PAGES = 5;

export default function TutorsPage() {
  const { filter, resetFilter } = useFilterStore();
  const [tutors, setTutors] = useState<TutorProfile[] | null>(null);
  const [fetchError, setFetchError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [subjectMap, setSubjectMap] = useState<Record<string, string>>({});
  const [districtMap, setDistrictMap] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, left: 0 });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const handlePageChange = useCallback((nextPage: number) => {
    setCurrentPage(nextPage);
    requestAnimationFrame(scrollToTop);
  }, [scrollToTop]);

  useEffect(() => {
    let active = true;
    void Promise.all([getSubjectMap(), getDistrictMap()]).then(
      ([subjects, districts]) => {
        if (!active) return;
        setSubjectMap(subjects);
        setDistrictMap(districts);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    scrollToTop();
    let active = true;
    startTransition(() => {
      void getTutors(filter)
        .then((data) => {
          if (!active) return;
          setTutors(data);
          setFetchError(false);
          setCurrentPage(1);
        })
        .catch(() => {
          if (!active) return;
          setTutors([]);
          setFetchError(true);
        });
    });

    return () => {
      active = false;
    };
  }, [filter, scrollToTop, retryKey]);

  const loading = tutors === null || isPending;

  const keywordFiltered = useMemo(() => {
    const tutorList = tutors ?? [];
    if (!searchValue.trim()) return tutorList;
    const q = searchValue.toLowerCase();
    return tutorList.filter((tutor) =>
      tutor.fullName.toLowerCase().includes(q) ||
      tutor.bio.toLowerCase().includes(q),
    );
  }, [searchValue, tutors]);

  const totalPages = Math.max(1, Math.ceil(keywordFiltered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pagedTutors = keywordFiltered.slice(startIndex, endIndex);
  const displayFrom = keywordFiltered.length === 0 ? 0 : startIndex + 1;
  const displayTo = Math.min(endIndex, keywordFiltered.length);

  const visiblePages = useMemo(() => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const half = Math.floor(MAX_VISIBLE_PAGES / 2);
    let start = safeCurrentPage - half;
    let end = safeCurrentPage + half;

    if (start < 1) {
      start = 1;
      end = MAX_VISIBLE_PAGES;
    }

    if (end > totalPages) {
      end = totalPages;
      start = totalPages - MAX_VISIBLE_PAGES + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [safeCurrentPage, totalPages]);

  const activeFilterCount = [
    filter.cityId,
    filter.districtId,
    filter.subjectId,
    filter.teachingMode !== "ALL" ? "mode" : "",
  ].filter(Boolean).length;

  const filterSummary = activeFilterCount
    ? `${activeFilterCount} bộ lọc nâng cao đang được áp dụng`
    : "Đang hiển thị gia sư phù hợp nhất";

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <PageAnimations />

      <section className="relative overflow-hidden border-b border-border/70 bg-[linear-gradient(135deg,#10233f_0%,#16386a_52%,#174070_100%)]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        <div className="site-container relative py-8 sm:py-10 lg:py-12">
          <div className="pa-hero max-w-3xl space-y-3 text-white">
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Chọn gia sư phù hợp theo môn học, khu vực và lịch của gia đình
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/76 sm:text-base">
              Lọc nhanh hồ sơ đã xác minh, xem đánh giá từ phụ huynh và đặt lịch học thử trong một luồng rõ ràng.
            </p>
          </div>

          <div className="relative z-10 mt-7 lg:mt-8">
            <FilterBarCompact
              searchValue={searchValue}
              onSearchChange={setSearchValue}
              summary={filterSummary}
              activeCount={activeFilterCount}
              onOpenAdvanced={() => setAdvancedOpen(true)}
              onSubmit={() => setCurrentPage(1)}
            />
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="site-container space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-2xl font-bold text-foreground">Gia sư phù hợp</h2>
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>{loading ? "Đang tải..." : `${keywordFiltered.length} gia sư phù hợp`}</span>
            </div>
          </div>

          <AdvancedFiltersSheet
            open={advancedOpen}
            onOpenChange={setAdvancedOpen}
            title="Bộ lọc nâng cao"
            description="Tinh chỉnh theo thành phố, quận, hình thức học, môn học và sắp xếp."
            onApply={() => {
              setAdvancedOpen(false);
              setCurrentPage(1);
            }}
            onReset={() => {
              resetFilter();
              setCurrentPage(1);
            }}
          >
            <TutorFilter compact />
          </AdvancedFiltersSheet>

          {loading ? (
            <SkeletonGrid count={6} />
          ) : fetchError ? (
            <EmptyState
              icon={ServerOff}
              title="Không thể kết nối máy chủ"
              description="Vui lòng kiểm tra kết nối hoặc thử lại sau. Dữ liệu gia sư của bạn vẫn được giữ nguyên."
              action={{
                label: "Thử lại",
                onClick: () => {
                  setTutors(null);
                  setRetryKey((k) => k + 1);
                },
              }}
            />
          ) : keywordFiltered.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Không tìm thấy gia sư phù hợp"
              description="Thử đổi từ khóa, mở rộng khu vực hoặc bỏ bớt bộ lọc để xem nhiều hồ sơ hơn."
              action={{
                label: "Đặt lại bộ lọc",
                onClick: resetFilter,
              }}
            />
          ) : (
            <>
              <TutorList
                tutors={pagedTutors}
                subjectMap={subjectMap}
                districtMap={districtMap}
              />

              <div className="surface-card flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Hiển thị <span className="font-semibold text-foreground">{displayFrom}-{displayTo}</span> trên{" "}
                  <span className="font-semibold text-foreground">{keywordFiltered.length}</span> gia sư
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={() => handlePageChange(Math.max(1, safeCurrentPage - 1))}
                    disabled={safeCurrentPage === 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Trước
                  </Button>

                  {visiblePages.map((page) => (
                    <Button
                      key={page}
                      size="sm"
                      variant={safeCurrentPage === page ? "default" : "outline"}
                      className="h-9 min-w-9 px-2"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5"
                    onClick={() => handlePageChange(Math.min(totalPages, safeCurrentPage + 1))}
                    disabled={safeCurrentPage === totalPages}
                  >
                    Sau
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
