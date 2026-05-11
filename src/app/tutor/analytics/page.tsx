"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Skeleton } from "@/components/ui/skeleton";
import { getTutorAnalytics } from "@/api/analyticsApi";
import type { TutorAnalyticsData } from "@/api/analyticsApi";
import { formatCurrency } from "@/lib/utils";

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

export default function TutorAnalyticsPage() {
  const [data, setData] = useState<TutorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTutorAnalytics().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, []);

  if (loading) {
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

  if (!data) {
    return (
      <div className="flex flex-col items-center gap-3 py-20">
        <BarChart2 className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">Không thể tải dữ liệu analytics</p>
      </div>
    );
  }

  const { summary, weeklyEarnings, monthlySessions, ratingTrend } = data;

  return (
    <div className="space-y-8 p-6">
      <PageAnimations />
      {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm">Hiệu suất giảng dạy và thu nhập của bạn</p>
        </div>

        {/* KPI grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            icon={Wallet}
            label="Tổng thu nhập"
            value={formatCurrency(summary.totalEarnings)}
            sub="Sau khi trừ 10% phí nền tảng"
            color="bg-emerald-500"
          />
          <KpiCard
            icon={BookOpen}
            label="Tổng buổi dạy"
            value={String(summary.totalSessions)}
            sub={`${summary.completedSessions} buổi hoàn thành`}
            color="bg-primary"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Tỉ lệ hoàn thành"
            value={`${summary.completionRate}%`}
            sub="Buổi không bị hủy"
            color="bg-blue-500"
          />
          <KpiCard
            icon={Star}
            label="Đánh giá trung bình"
            value={summary.ratingAvg > 0 ? summary.ratingAvg.toFixed(1) : "—"}
            sub={`${summary.reviewCount} lượt đánh giá`}
            color="bg-amber-500"
          />
          <KpiCard
            icon={TrendingUp}
            label="Buổi hoàn thành"
            value={String(summary.completedSessions)}
            sub="Tổng số buổi đã dạy xong"
            color="bg-violet-500"
          />
          <KpiCard
            icon={BarChart2}
            label="Số lượt đánh giá"
            value={String(summary.reviewCount)}
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
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyEarnings} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value ?? 0)), "Thu nhập"]}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly sessions chart */}
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Số buổi dạy theo tháng</h2>
            <span className="text-xs text-muted-foreground">(6 tháng gần nhất)</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySessions} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip
                formatter={(value) => [Number(value ?? 0), "Buổi dạy"]}
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "12px",
                  fontSize: 12,
                }}
              />
              <Bar dataKey="count" fill="oklch(0.5 0.15 250)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  formatter={(value) => [`${Number(value ?? 0)} sao`, "Đánh giá"]}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
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
    </div>
  );
}
