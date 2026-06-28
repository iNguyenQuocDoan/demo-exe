"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Repeat2,
  Star,
  TrendingUp,
  UserPen,
  Wallet,
  XCircle,
} from "lucide-react";
import { getBookings, acceptBooking, cancelBooking, getSeries, acceptSeries } from "@/api/bookingApi";
import { getUserNameMap } from "@/api/referenceApi";
import { getReviews } from "@/api/tutorApi";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatVietnamDateTime, formatVietnamTime, formatVietnamShortDate, formatVietnamDayMonth } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Booking, Review, ScheduleSeries } from "@/types";

const DAY_OF_WEEK = ["", "CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function TutorDashboard() {
  const { user, isLoading } = useAuthStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [series, setSeries] = useState<ScheduleSeries[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [parentNameMap, setParentNameMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const tutorId = user?.tutorProfileId ?? null;

  const loadData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const [bookingData, seriesData, reviewData] = await Promise.all([
        getBookings({ tutorId: id }),
        getSeries({ tutorId: id }),
        getReviews(id),
      ]);
      setBookings(bookingData.filter((item) => !item.seriesId));
      setSeries(seriesData);
      setReviews(reviewData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    if (!user.tutorProfileId) { setLoading(false); return; }
    void loadData(user.tutorProfileId);
  }, [isLoading, loadData, user]);

  useEffect(() => {
    const parentIds = [...bookings.map((b) => b.parentId), ...series.map((s) => s.parentId)];
    if (parentIds.length === 0) return;
    let active = true;
    void getUserNameMap(parentIds).then((map) => {
      if (!active) return;
      setParentNameMap(map);
    });
    return () => { active = false; };
  }, [bookings, series]);

  const parentName = (parentId: string) => parentNameMap[parentId] ?? parentId;

  const handleAccept = async (bookingId: string) => {
    const key = `accept-${bookingId}`;
    setActionLoadingId(key);
    try {
      await acceptBooking(bookingId);
      if (tutorId) await loadData(tutorId);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    if (!tutorId) return;
    const key = `decline-${bookingId}`;
    setActionLoadingId(key);
    try {
      await cancelBooking(bookingId, tutorId, "Gia sư từ chối booking");
      await loadData(tutorId);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptSeries = async (seriesId: string) => {
    const key = `accept-series-${seriesId}`;
    setActionLoadingId(key);
    try {
      await acceptSeries(seriesId);
      if (tutorId) await loadData(tutorId);
    } finally {
      setActionLoadingId(null);
    }
  };

  const pendingBookings = useMemo(
    () => bookings.filter((b) => b.status === "Pending"),
    [bookings]
  );
  const confirmedBookings = useMemo(
    () => bookings.filter((b) => b.status === "Confirmed"),
    [bookings]
  );
  const completedBookings = useMemo(
    () => bookings.filter((b) => b.status === "Completed"),
    [bookings]
  );

  const avgRating = useMemo(() => {
    if (!reviews.length) return null;
    return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  const unrespondedReviews = useMemo(
    () => reviews.filter((r) => !r.tutorReply).length,
    [reviews]
  );

  const thisMonthEarnings = useMemo(() => {
    const now = new Date();
    return completedBookings
      .filter((b) => {
        const d = new Date(b.startAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((s, b) => s + (b.baseAmount - b.platformFee), 0);
  }, [completedBookings]);

  if (isLoading || loading) return <TutorDashboardSkeleton />;

  if (!tutorId) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container max-w-3xl">
            <div className="surface-card p-8 text-center">
              <h1 className="text-xl font-bold text-foreground">Tài khoản chưa có hồ sơ gia sư</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Vui lòng liên hệ admin để kích hoạt hồ sơ trước khi nhận booking.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const firstName = user?.fullName?.split(" ").pop() ?? "Gia sư";

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container space-y-4">

          {/* ── Hero banner ─────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-primary/70 p-5 sm:p-6 text-white">
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-6 right-16 h-24 w-24 rounded-full bg-white/5" />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white/70">Xin chào 👋</p>
                <h1 className="text-2xl font-bold tracking-tight">{firstName}</h1>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-white/80">
                  {avgRating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                      {avgRating}/5 · {reviews.length} đánh giá
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5" />
                    {completedBookings.length} buổi hoàn thành
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {pendingBookings.length > 0 && (
                  <Link
                    href="/tutor/bookings"
                    className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                  >
                    <Bell className="h-4 w-4" />
                    {pendingBookings.length} yêu cầu mới
                  </Link>
                )}
                <Link
                  href="/tutor/availability"
                  className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
                >
                  <Clock3 className="h-4 w-4" />
                  Quản lý lịch trống
                </Link>
              </div>
            </div>
          </div>

          {/* ── KPI row ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Link href="/tutor/bookings" className="group surface-card flex flex-col gap-3 p-4 transition-all hover:border-warning/40 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Chờ xác nhận</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
                  <Clock3 className="h-4 w-4 text-warning" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-foreground">{pendingBookings.length}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">booking chờ bạn</p>
              </div>
              {pendingBookings.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                  Cần xử lý <ArrowRight className="h-3 w-3" />
                </span>
              )}
            </Link>

            <Link href="/tutor/bookings" className="group surface-card flex flex-col gap-3 p-4 transition-all hover:border-success/40 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Đã xác nhận</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-foreground">{confirmedBookings.length}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">lịch sắp dạy</p>
              </div>
            </Link>

            <div className="surface-card flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Lịch định kỳ</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Repeat2 className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold tracking-tight text-foreground">{series.length}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">hợp đồng định kỳ</p>
              </div>
            </div>

            <Link href="/tutor/wallet" className="group surface-card flex flex-col gap-3 p-4 transition-all hover:border-emerald-300 hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Thu tháng này</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-foreground">{formatCurrency(thisMonthEarnings)}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">từ {completedBookings.length} buổi</p>
              </div>
            </Link>
          </div>

          {/* ── Pending + Upcoming (2-col) ───────────────────────── */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
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
                  <Link href="/tutor/bookings" className="inline-flex items-center gap-1">Xem tất cả <ArrowRight className="h-3 w-3" /></Link>
                </Button>
              </div>
              {pendingBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                    <CheckCircle2 className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Không có yêu cầu nào</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Tất cả đã được xử lý</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pendingBookings.slice(0, 3).map((booking) => (
                    <article
                      key={booking.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="truncate text-sm font-semibold text-foreground">
                            {parentName(booking.parentId)}
                          </span>
                          {booking.subject && (
                            <Badge variant="outline" className="text-xs">{booking.subject}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatVietnamDateTime(booking.startAt)} · {formatCurrency(booking.totalAmount)}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          size="sm"
                          className="h-8"
                          loading={actionLoadingId === `accept-${booking.id}`}
                          onClick={() => handleAccept(booking.id)}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Chấp nhận
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8"
                          loading={actionLoadingId === `decline-${booking.id}`}
                          onClick={() => handleDecline(booking.id)}
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Từ chối
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="surface-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-success" />
                  <h2 className="text-sm font-semibold text-foreground">Lịch sắp dạy</h2>
                  {confirmedBookings.length > 0 && (
                    <Badge variant="success" className="text-xs">{confirmedBookings.length}</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                  <Link href="/tutor/schedule" className="inline-flex items-center gap-1">Xem lịch <ArrowRight className="h-3 w-3" /></Link>
                </Button>
              </div>
              {confirmedBookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                    <CalendarDays className="h-6 w-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Chưa có lịch dạy</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Cập nhật lịch trống để nhận booking</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {confirmedBookings.slice(0, 4).map((booking) => (
                    <article key={booking.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex h-10 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-success/10 text-center">
                        <span className="text-[10px] font-medium leading-tight text-success">
                          {formatVietnamDayMonth(booking.startAt)}
                        </span>
                        <span className="text-xs font-bold leading-tight text-success">
                          {formatVietnamTime(booking.startAt)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {parentName(booking.parentId)}
                        </p>
                        {booking.subject && (
                          <p className="text-xs text-muted-foreground">{booking.subject}</p>
                        )}
                      </div>
                      <Button size="sm" variant="outline" className="h-7 shrink-0 px-2 text-xs" asChild>
                        <Link href={`/tutor/bookings/${booking.id}`}>Chi tiết</Link>
                      </Button>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Reviews ────────────────────────────────────────── */}
          {reviews.length > 0 && (
            <section className="surface-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <h2 className="text-sm font-semibold text-foreground">Đánh giá gần đây</h2>
                  {avgRating && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {avgRating}
                    </span>
                  )}
                  {unrespondedReviews > 0 && (
                    <Badge variant="warning" className="text-xs">{unrespondedReviews} chờ phản hồi</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs">
                  <Link href="/tutor/reviews" className="inline-flex items-center gap-1">Xem tất cả <ArrowRight className="h-3 w-3" /></Link>
                </Button>
              </div>
              <div className="divide-y divide-border">
                {reviews
                  .slice()
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 3)
                  .map((review) => (
                    <article key={review.id} className="space-y-1.5 px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">{review.parentName}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {formatVietnamShortDate(review.createdAt)}
                          </span>
                          {!review.tutorReply ? (
                            <Badge variant="warning">Chưa phản hồi</Badge>
                          ) : (
                            <Badge variant="success">Đã phản hồi</Badge>
                          )}
                        </div>
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">{review.comment}</p>
                      {!review.tutorReply && (
                        <Button variant="outline" size="sm" asChild className="h-7 gap-1.5 text-xs">
                          <Link href="/tutor/reviews">
                            <MessageSquare className="h-3 w-3" />
                            Phản hồi
                          </Link>
                        </Button>
                      )}
                    </article>
                  ))}
              </div>
            </section>
          )}

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
                        <span className="text-sm font-semibold text-foreground">{parentName(item.parentId)}</span>
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
                        loading={actionLoadingId === `accept-series-${item.id}`}
                        onClick={() => handleAcceptSeries(item.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Chấp nhận
                      </Button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ── Quick nav grid ──────────────────────────────────── */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { href: "/tutor/schedule",    icon: CalendarDays,  label: "Lịch dạy",     color: "text-primary",     bg: "bg-primary/10" },
              { href: "/tutor/bookings",    icon: BookOpen,      label: "Booking",       color: "text-blue-600",    bg: "bg-blue-50" },
              { href: "/tutor/availability",icon: Clock3,        label: "Lịch trống",    color: "text-success",     bg: "bg-success/10" },
              { href: "/messages",          icon: MessageSquare, label: "Tin nhắn",      color: "text-violet-600",  bg: "bg-violet-50" },
              { href: "/tutor/wallet",      icon: Wallet,        label: "Ví thu nhập",   color: "text-emerald-600", bg: "bg-emerald-50" },
              { href: "/tutor/profile",     icon: UserPen,       label: "Hồ sơ",         color: "text-amber-600",   bg: "bg-amber-50" },
            ].map(({ href, icon: Icon, label, color, bg }) => (
              <Link
                key={href}
                href={href}
                className="surface-card group flex flex-col items-center gap-2.5 p-4 text-center transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bg} transition-transform group-hover:scale-110`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <span className="text-xs font-semibold text-foreground">{label}</span>
              </Link>
            ))}
          </section>

        </div>
      </section>
    </main>
  );
}

function TutorDashboardSkeleton() {
  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
