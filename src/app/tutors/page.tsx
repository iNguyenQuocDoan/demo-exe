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
  const { filter, resetFilter, setFilter } = useFilterStore();
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
    setFetchError(false);
    startTransition(() => {
      void getTutors(filter)
        .then((data) => {
          if (!active) return;
          setTutors(data);
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
  const tutorList = tutors ?? [];

  const keywordFiltered = useMemo(() => {
    if (!searchValue.trim()) return tutorList;
    const q = searchValue.toLowerCase();
    return tutorList.filter((tutor) =>
      tutor.fullName.toLowerCase().includes(q) ||
      tutor.bio.toLowerCase().includes(q),
    );
  }, [searchValue, tutorList]);

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

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const activeFilterCount = [
    filter.cityId,
    filter.districtId,
    filter.subjectId,
    filter.teachingMode !== "ALL" ? "mode" : "",
  ].filter(Boolean).length;

  const filterSummary = activeFilterCount
    ? `${activeFilterCount} bộ lọc nâng cao đang được áp dụng`
    : "Đang dùng bộ lọc mặc định";

  return (
    <main className="min-h-dvh bg-[var(--bg-app)]">
      <PageAnimations />

      <section className="pt-4 pb-8">
        <div className="site-container space-y-3">
          {/* Compact header: short title + live count */}
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Gia sư</h1>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>{loading ? "Đang tải..." : `${keywordFiltered.length} gia sư phù hợp`}</span>
            </div>
          </div>

          <FilterBarCompact
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            summary={filterSummary}
            activeCount={activeFilterCount}
            onOpenAdvanced={() => setAdvancedOpen(true)}
            onSubmit={() => setCurrentPage(1)}
          />

          <AdvancedFiltersSheet
            open={advancedOpen}
            onOpenChange={setAdvancedOpen}
            title="Bộ lọc nâng cao"
            description="Tinh chỉnh theo thành phố, quận, hình thức, môn học và sắp xếp."
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
            <SkeletonGrid count={4} />
          ) : fetchError ? (
            <EmptyState
              icon={ServerOff}
              title="Không thể kết nối máy chủ"
              description="Vui lòng kiểm tra kết nối hoặc thử lại sau."
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
              title="Không tìm thấy gia sư"
              description="Thử thay đổi từ khóa hoặc bộ lọc để tìm kết quả phù hợp hơn."
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

              <div className="surface-card flex flex-col gap-3 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Hiển thị <span className="font-semibold text-foreground">{displayFrom}-{displayTo}</span> trên{" "}
                  <span className="font-semibold text-foreground">{keywordFiltered.length}</span> gia sư
                </p>

                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
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
                      className="h-8 min-w-8 px-2"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  ))}

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5"
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
