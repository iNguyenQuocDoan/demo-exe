"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Flag,
  Repeat2,
  Search,
  Star,
  Wallet,
  XCircle,
} from "lucide-react";
import { ReviewModal } from "@/components/booking/ReviewModal";
import { getBookings, cancelBooking, acceptBooking, getSeries, acceptSeries } from "@/api/bookingApi";
import { getTutorNameMap } from "@/api/referenceApi";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { KpiCardCompact } from "@/components/shared/KpiCardCompact";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatVietnamDateTime, formatVietnamTime, formatVietnamDayMonth } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Booking, ScheduleSeries } from "@/types";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
  Pending: { label: "Chờ xác nhận", variant: "warning" },
  AwaitingPayment: { label: "Chờ thanh toán", variant: "warning" },
  Confirmed: { label: "Đã xác nhận", variant: "success" },
  InProgress: { label: "Đang học", variant: "default" },
  Completed: { label: "Hoàn thành", variant: "secondary" },
  Cancelled: { label: "Đã huỷ", variant: "destructive" },
};

const DAY_OF_WEEK = ["", "CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function ParentDashboard() {
  const { user, isLoading } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [series, setSeries] = useState<ScheduleSeries[]>([]);
  const [tutorNameMap, setTutorNameMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);

  const parentId = user?.id ?? null;

  const loadData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const [bookingData, seriesData] = await Promise.all([
        getBookings({ parentId: id }),
        getSeries({ parentId: id }),
      ]);
      setBookings(bookingData.filter((item) => !item.seriesId));
      setSeries(seriesData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    void loadData(user.id);
  }, [isLoading, loadData, user]);

  useEffect(() => {
    const tutorIds = [...bookings.map((b) => b.tutorId), ...series.map((s) => s.tutorId)];
    if (tutorIds.length === 0) return;
    let active = true;
    void getTutorNameMap(tutorIds).then((map) => {
      if (!active) return;
      setTutorNameMap(map);
    });
    return () => { active = false; };
  }, [bookings, series]);

  const handleCancel = async (bookingId: string) => {
    if (!parentId) return;
    setActionLoadingId(`cancel-${bookingId}`);
    try {
      await cancelBooking(bookingId, parentId, "Phụ huynh huỷ lịch");
      await loadData(parentId);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSimulateAccept = async (id: string, type: "booking" | "series") => {
    if (!parentId) return;
    setActionLoadingId(`accept-${type}-${id}`);
    try {
      if (type === "booking") await acceptBooking(id);
      else await acceptSeries(id);
      await loadData(parentId);
    } finally {
      setActionLoadingId(null);
    }
  };

  const stats = useMemo(
    () => ({
      total: bookings.length,
      confirmed: bookings.filter((b) => b.status === "Confirmed").length,
      pending: bookings.filter((b) => b.status === "Pending").length,
      completed: bookings.filter((b) => b.status === "Completed").length,
    }),
    [bookings]
  );

  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === "Pending"),
    [bookings]
  );

  const confirmedBookings = useMemo(
    () => bookings.filter((b) => b.status === "Confirmed"),
    [bookings]
  );

  const recentBookings = useMemo(
    () => bookings.slice().sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()).slice(0, 5),
    [bookings]
  );

  if (isLoading || loading) return <ParentDashboardSkeleton />;

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container space-y-4">

          {/* ── Compact header ─────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/parent/wallet">
                  <Wallet className="h-3.5 w-3.5" />
                  Ví của tôi
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href="/parent/bookings">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Lịch học
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5">
                <Link href="/my-disputes">
                  <Flag className="h-3.5 w-3.5" />
                  Khiếu nại
                </Link>
              </Button>
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/tutors">
                  <Search className="h-3.5 w-3.5" />
                  Tìm gia sư
                </Link>
              </Button>
            </div>
          </div>

          {/* ── KPI row ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCardCompact
              label="Tổng lịch"
              value={stats.total}
              icon={CalendarDays}
              iconColor="text-primary"
              iconBg="bg-primary/10"
              href="/parent/bookings"
            />
            <KpiCardCompact
              label="Đã xác nhận"
              value={stats.confirmed}
              icon={CheckCircle2}
              iconColor="text-success"
              iconBg="bg-success/10"
            />
            <KpiCardCompact
              label="Chờ xác nhận"
              value={stats.pending}
              icon={Clock3}
              iconColor="text-warning"
              iconBg="bg-warning/10"
            />
            <KpiCardCompact
              label="Hoàn thành"
              value={stats.completed}
              icon={Repeat2}
            />
          </div>

          {/* ── Action + Upcoming (2-col) ───────────────────────── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

            {/* Pending — need action */}
            <section className="surface-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-warning" />
                  <h2 className="text-sm font-semibold text-foreground">Chờ xác nhận</h2>
                  {pendingBookings.length > 0 && (
                    <Badge variant="warning" className="text-xs">{pendingBookings.length}</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                  <Link href="/parent/bookings" className="inline-flex items-center gap-1">Xem tất cả <ArrowRight className="h-3 w-3" /></Link>
                </Button>
              </div>
              {pendingBookings.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                  Không có lịch đang chờ xác nhận.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pendingBookings.slice(0, 3).map((booking) => (
                    <article
                      key={booking.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {tutorNameMap[booking.tutorId] ?? booking.tutorId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatVietnamDateTime(booking.startAt)} · {formatCurrency(booking.totalAmount)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8"
                          loading={actionLoadingId === `accept-booking-${booking.id}`}
                          onClick={() => handleSimulateAccept(booking.id, "booking")}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Xác nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          loading={actionLoadingId === `cancel-${booking.id}`}
                          onClick={() => handleCancel(booking.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Huỷ
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Confirmed upcoming */}
            <section className="surface-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <h2 className="text-sm font-semibold text-foreground">Lịch sắp học</h2>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                  <Link href="/parent/bookings" className="inline-flex items-center gap-1">Xem tất cả <ArrowRight className="h-3 w-3" /></Link>
                </Button>
              </div>
              {confirmedBookings.length === 0 ? (
                <div className="space-y-3 px-5 py-8 text-center">
                  <p className="text-sm text-muted-foreground">Chưa có lịch đã xác nhận.</p>
                  <Button asChild size="sm" variant="outline" className="gap-1.5">
                    <Link href="/tutors">
                      <Search className="h-3.5 w-3.5" />
                      Tìm gia sư
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {confirmedBookings.slice(0, 4).map((booking) => {
                    return (
                      <article key={booking.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="flex h-9 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-success/10 text-center">
                          <span className="text-[10px] font-medium leading-tight text-success">
                            {formatVietnamDayMonth(booking.startAt)}
                          </span>
                          <span className="text-xs font-semibold leading-tight text-success">
                            {formatVietnamTime(booking.startAt)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {tutorNameMap[booking.tutorId] ?? booking.tutorId}
                          </p>
                          {booking.subject && (
                            <p className="text-xs text-muted-foreground">{booking.subject}</p>
                          )}
                        </div>
                        <Badge variant="success" className="shrink-0 text-xs">Xác nhận</Badge>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* ── Recent bookings ────────────────────────────────── */}
          <section className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Lịch đặt gần đây</h2>
              </div>
              <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                <Link href="/parent/bookings" className="inline-flex items-center gap-1">Xem tất cả <ArrowRight className="h-3 w-3" /></Link>
              </Button>
            </div>

            {bookings.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">Bạn chưa có lịch học nào.</p>
                <Button asChild variant="outline" className="mt-4" size="sm">
                  <Link href="/tutors">Đặt lịch ngay</Link>
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentBookings.map((booking) => {
                  const status = STATUS_BADGE[booking.status] ?? { label: booking.status, variant: "secondary" as const };
                  return (
                    <article
                      key={booking.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {tutorNameMap[booking.tutorId] ?? booking.tutorId}
                          </span>
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <Badge variant="secondary">{booking.type === "SERIES_SESSION" ? "Định kỳ" : "Buổi lẻ"}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatVietnamDateTime(booking.startAt)} · {formatCurrency(booking.totalAmount)}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="h-8" asChild>
                          <Link href={`/parent/bookings/${booking.id}`}>Chi tiết</Link>
                        </Button>
                        {booking.status === "Completed" && (
                          <Button size="sm" className="h-8 gap-1.5" onClick={() => setReviewTarget(booking)}>
                            <Star className="h-3.5 w-3.5" />
                            Đánh giá
                          </Button>
                        )}
                        {booking.status === "Confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            loading={actionLoadingId === `cancel-${booking.id}`}
                            onClick={() => handleCancel(booking.id)}
                          >
                            Huỷ lịch
                          </Button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Series ─────────────────────────────────────────── */}
          {series.length > 0 && (
            <section className="surface-card overflow-hidden">
              <div className="border-b border-border px-5 py-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Repeat2 className="h-4 w-4 text-primary" />
                  Lịch định kỳ ({series.length})
                </h2>
              </div>
              <div className="divide-y divide-border">
                {series.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {tutorNameMap[item.tutorId] ?? item.tutorId}
                        </span>
                        <Badge variant={item.status === "Confirmed" ? "success" : "warning"}>
                          {item.status === "Confirmed" ? "Đã xác nhận" : "Chờ xác nhận"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {item.daysOfWeek.map((d) => DAY_OF_WEEK[d]).join(", ")} · {item.startTime} · {item.occurrenceCount} buổi · {formatCurrency(item.totalAmount)}
                      </p>
                    </div>

                    {item.status === "Pending" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={actionLoadingId === `accept-series-${item.id}`}
                        onClick={() => handleSimulateAccept(item.id, "series")}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Giả lập xác nhận
                      </Button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

        </div>
      </section>

      <ReviewModal
        open={!!reviewTarget}
        bookingId={reviewTarget?.id ?? ""}
        tutorId={reviewTarget?.tutorId ?? ""}
        tutorName={reviewTarget ? tutorNameMap[reviewTarget.tutorId] : undefined}
        onClose={() => setReviewTarget(null)}
      />
    </main>
  );
}

function ParentDashboardSkeleton() {
  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-7 w-32 rounded-lg" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-lg" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </section>
    </main>
  );
}
