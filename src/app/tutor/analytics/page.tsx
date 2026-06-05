"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  BookOpen,
  Star,
  Wallet,
  CheckCircle2,
  BarChart2,
  Clock3,
  CalendarClock,
} from "lucide-react";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getBookings } from "@/api/bookingApi";
import { getReviews } from "@/api/tutorApi";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Booking, Review } from "@/types";

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

/** Khu vực biểu đồ chưa đủ dữ liệu thật → hiển thị trạng thái rỗng thay vì trục trống. */
function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-55 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/20 text-center">
      <BarChart2 className="h-8 w-8 text-muted-foreground/40" />
      <p className="max-w-xs text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

const MS_WEEK = 7 * 24 * 60 * 60 * 1000;

/** Đầu tuần (Thứ 2) theo local time. */
function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7; // Mon=0 … Sun=6
  x.setDate(x.getDate() - day);
  return x;
}

export default function TutorAnalyticsPage() {
  const { user, isLoading } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const tutorId = user?.tutorProfileId ?? null;

  useEffect(() => {
    if (isLoading || !user) return;
    if (!tutorId) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all([getBookings({ tutorId }), getReviews(tutorId)])
      .then(([bookingData, reviewData]) => {
        if (!active) return;
        setBookings(bookingData);
        setReviews(reviewData);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isLoading, user, tutorId]);

  const analytics = useMemo(() => {
    const completed = bookings.filter((b) => b.status === "Completed");
    const cancelled = bookings.filter((b) => b.status === "Cancelled");

    const totalEarnings = completed.reduce(
      (sum, b) => sum + Math.max(b.baseAmount - b.platformFee, 0),
      0,
    );
    const totalSessions = bookings.length;
    const completedSessions = completed.length;
    const completionRate =
      totalSessions > 0
        ? Math.round(((totalSessions - cancelled.length) / totalSessions) * 100)
        : 0;
    const ratingAvg =
      reviews.length > 0
        ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
        : 0;

    // Số buổi hoàn thành theo 6 tháng gần nhất
    const now = new Date();
    const monthBuckets = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, month: `Th${d.getMonth() + 1}`, count: 0 };
    });
    for (const b of completed) {
      const d = new Date(b.startAt);
      const bucket = monthBuckets.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (bucket) bucket.count += 1;
    }
    const monthlySessions = monthBuckets.map(({ month, count }) => ({ month, count }));

    // Thu nhập theo 8 tuần gần nhất
    const weekStart = startOfWeek(now).getTime();
    const weekBuckets = Array.from({ length: 8 }, (_, i) => {
      const ts = weekStart - (7 - i) * MS_WEEK;
      const wd = new Date(ts);
      return { ts, week: `${wd.getDate()}/${wd.getMonth() + 1}`, amount: 0 };
    });
    for (const b of completed) {
      const ts = startOfWeek(new Date(b.startAt)).getTime();
      const bucket = weekBuckets.find((x) => x.ts === ts);
      if (bucket) bucket.amount += Math.max(b.baseAmount - b.platformFee, 0);
    }
    const weeklyEarnings = weekBuckets.map(({ week, amount }) => ({ week, amount }));

    const ratingTrend = reviews
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-10)
      .map((r) => ({
        date: new Date(r.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
        rating: r.rating,
      }));

    return {
      totalEarnings,
      totalSessions,
      completedSessions,
      completionRate,
      ratingAvg,
      reviewCount: reviews.length,
      monthlySessions,
      weeklyEarnings,
      ratingTrend,
      hasAnyActivity: bookings.length > 0 || reviews.length > 0,
    };
  }, [bookings, reviews]);

  if (isLoading || loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  // Chưa có hồ sơ gia sư → không có dữ liệu để phân tích
  if (!tutorId) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-8 text-center">
          <BarChart2 className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h1 className="mt-3 text-xl font-bold text-foreground">Chưa có dữ liệu phân tích</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tài khoản chưa có hồ sơ gia sư đang hoạt động. Hồ sơ cần được kích hoạt trước khi
            hệ thống ghi nhận buổi học và thu nhập.
          </p>
        </div>
      </div>
    );
  }

  const {
    totalEarnings, totalSessions, completedSessions, completionRate,
    ratingAvg, reviewCount, monthlySessions, weeklyEarnings, ratingTrend, hasAnyActivity,
  } = analytics;

  const hasMonthly = monthlySessions.some((m) => m.count > 0);
  const hasWeekly = weeklyEarnings.some((w) => w.amount > 0);

  return (
    <div className="space-y-8 p-6">
      <PageAnimations />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm">
          Hiệu suất giảng dạy và thu nhập của bạn — tổng hợp từ các buổi học và đánh giá thực tế.
        </p>
      </div>

      {/* Chưa có hoạt động nào — getting started */}
      {!hasAnyActivity ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
          <CalendarClock className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">
            Dữ liệu sẽ xuất hiện khi có hoạt động thực tế
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Bạn chưa có buổi học hay đánh giá nào. Sau khi hoàn thành buổi học đầu tiên, các chỉ số
            thu nhập, số buổi dạy và đánh giá sẽ được tổng hợp tại đây.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Button asChild size="sm" className="gap-1.5">
              <Link href="/tutor/availability">
                <Clock3 className="h-4 w-4" />
                Cập nhật lịch trống
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-1.5">
              <Link href="/tutor/bookings">
                <BookOpen className="h-4 w-4" />
                Xem booking
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* KPI grid — tất cả tính từ dữ liệu thật */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard
              icon={Wallet}
              label="Tổng thu nhập"
              value={formatCurrency(totalEarnings)}
              sub="Sau khi trừ phí nền tảng · từ buổi đã hoàn thành"
              color="bg-emerald-500"
            />
            <KpiCard
              icon={BookOpen}
              label="Tổng buổi dạy"
              value={String(totalSessions)}
              sub={`${completedSessions} buổi hoàn thành`}
              color="bg-primary"
            />
            <KpiCard
              icon={CheckCircle2}
              label="Tỉ lệ hoàn thành"
              value={`${completionRate}%`}
              sub="Buổi không bị hủy"
              color="bg-blue-500"
            />
            <KpiCard
              icon={Star}
              label="Đánh giá trung bình"
              value={ratingAvg > 0 ? ratingAvg.toFixed(1) : "—"}
              sub={`${reviewCount} lượt đánh giá`}
              color="bg-amber-500"
            />
            <KpiCard
              icon={TrendingUp}
              label="Buổi hoàn thành"
              value={String(completedSessions)}
              sub="Tổng số buổi đã dạy xong"
              color="bg-violet-500"
            />
            <KpiCard
              icon={BarChart2}
              label="Số lượt đánh giá"
              value={String(reviewCount)}
              sub="Phản hồi từ phụ huynh"
              color="bg-rose-500"
            />
          </div>

          {/* Weekly earnings chart */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-500" />
              <h2 className="font-semibold">Thu nhập theo tuần</h2>
              <span className="text-xs text-muted-foreground">(8 tuần gần nhất)</span>
            </div>
            {hasWeekly ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyEarnings} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value ?? 0)), "Thu nhập"]}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="amount" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty message="Biểu đồ sẽ xuất hiện khi có buổi học hoàn thành phát sinh thu nhập." />
            )}
          </div>

          {/* Monthly sessions chart */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Số buổi dạy theo tháng</h2>
              <span className="text-xs text-muted-foreground">(6 tháng gần nhất)</span>
            </div>
            {hasMonthly ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlySessions} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    formatter={(value) => [Number(value ?? 0), "Buổi dạy"]}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="oklch(0.5 0.15 250)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty message="Biểu đồ sẽ xuất hiện khi bạn hoàn thành buổi dạy đầu tiên." />
            )}
          </div>

          {/* Rating trend */}
          {ratingTrend.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" />
                <h2 className="font-semibold">Xu hướng đánh giá</h2>
                <span className="text-xs text-muted-foreground">(các đánh giá gần nhất)</span>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={ratingTrend} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip
                    formatter={(value) => [`${Number(value ?? 0)} sao`, "Đánh giá"]}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="oklch(0.75 0.15 70)"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "oklch(0.75 0.15 70)" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
