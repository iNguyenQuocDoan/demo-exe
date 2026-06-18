"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarDays, Search } from "lucide-react";
import { getBookings } from "@/api/bookingApi";
import { getTutorNameMap, getUserNameMap } from "@/api/referenceApi";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatVietnamDateTime } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Booking, BookingStatus } from "@/types";
{/* nội dung comment */ }
const STATUS_OPTIONS: Array<{ key: "all" | BookingStatus; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "Pending", label: "Chờ xác nhận" },
  { key: "Confirmed", label: "Đã xác nhận" },
  { key: "Completed", label: "Hoàn thành" },
  { key: "Cancelled", label: "Đã huỷ" },
];

export default function AdminBookingsPage() {
  const { user, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]["key"]>("all");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [parentMap, setParentMap] = useState<Record<string, string>>({});
  const [tutorMap, setTutorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isLoading || !user) return;

    let mounted = true;
    setLoading(true);

    const load = async () => {
      const data = await getBookings({});
      const sorted = data.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime());

      const parentIds = Array.from(new Set(sorted.map((item) => item.parentId)));
      const tutorIds = Array.from(new Set(sorted.map((item) => item.tutorId)));
      const [parents, tutors] = await Promise.all([
        getUserNameMap(parentIds),
        getTutorNameMap(tutorIds),
      ]);

      if (!mounted) return;
      setBookings(sorted);
      setParentMap(parents);
      setTutorMap(tutors);
      setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [isLoading, user]);

  const filtered = useMemo(() => {
    const text = search.trim().toLowerCase();

    return bookings.filter((item) => {
      if (status !== "all" && item.status !== status) return false;
      if (!text) return true;

      const parentName = (parentMap[item.parentId] ?? item.parentId).toLowerCase();
      const tutorName = (tutorMap[item.tutorId] ?? item.tutorId).toLowerCase();
      return (
        item.id.toLowerCase().includes(text) ||
        parentName.includes(text) ||
        tutorName.includes(text)
      );
    });
  }, [bookings, parentMap, search, status, tutorMap]);

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-3">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }


  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Quản lý booking</h1>
            <span className="text-sm text-muted-foreground">
              {loading ? "Đang tải..." : `${filtered.length} kết quả`}
            </span>
          </div>

          <div className="surface-card p-3 space-y-3">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm booking, parent, tutor..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Tabs value={status} onValueChange={(value) => setStatus(value as typeof status)}>
              <TabsList className="w-full h-auto flex-wrap">
                {STATUS_OPTIONS.map((option) => (
                  <TabsTrigger key={option.key} value={option.key} className="text-xs sm:text-sm">
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <section className="surface-card overflow-hidden">
            <div className="border-b border-border px-5 py-4 sm:px-6">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" />
                Danh sách booking ({filtered.length})
              </h2>
            </div>

            {filtered.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-muted-foreground">Không có dữ liệu booking phù hợp.</div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-3 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6"
                  >
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:flex sm:flex-1 sm:gap-6">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{parentMap[item.parentId] ?? item.parentId}</p>
                        <p className="text-xs text-muted-foreground">Phụ huynh</p>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{tutorMap[item.tutorId] ?? item.tutorId}</p>
                        <p className="text-xs text-muted-foreground">Gia sư</p>
                      </div>
                      <div>
                        <Badge variant={item.status === "Cancelled" ? "destructive" : item.status === "Completed" ? "secondary" : "outline"}>
                          {item.status}
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">{item.type}</p>
                        {item.status === "Cancelled" && item.reason && (
                          <p className="mt-1 text-xs text-destructive/80 line-clamp-1">Lý do: {item.reason}</p>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{formatCurrency(item.totalAmount)}</p>
                        <p className="text-xs text-muted-foreground">{formatVietnamDateTime(item.startAt)}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
