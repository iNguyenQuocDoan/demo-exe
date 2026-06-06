"use client";

import { NotificationPanel } from "@/components/shared/NotificationPanel";

/**
 * Thanh trên cùng cho các khu vực có sidebar (gia sư / admin).
 * Chỉ hiện trên desktop (lg+) — trên mobile chuông nằm ở thanh menu của sidebar.
 * Mang <NotificationPanel/> tới những route mà SiteFrame ẩn Header.
 */
export function DashboardTopbar() {
  return (
    <div className="sticky top-0 z-30 hidden h-14 items-center justify-end gap-3 border-b border-border bg-card/80 px-6 backdrop-blur lg:flex">
      <NotificationPanel />
    </div>
  );
}
