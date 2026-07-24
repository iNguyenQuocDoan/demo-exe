"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  GraduationCap,
  RefreshCw,
  Settings,
  Shield,
  Star,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppIcon } from "@/components/ui/icon";
import { useAuthStore } from "@/store/useAuthStore";
import { getPendingTutors, type BeTutorDetail } from "@/api/tutorApi";
import { getDepositRequests, getWithdrawRequests } from "@/api/walletApi";
import { getUserNameMap } from "@/api/referenceApi";
import { getDashboardStats, type DashboardStats } from "@/api/statsApi";
import { DashboardPieChart, DashboardBarChart } from "@/components/admin/DashboardCharts";
import { SiteTrafficCard } from "@/components/admin/SiteTrafficCard";
import {
  DashboardFilter,
  type TimeFilter,
} from "@/components/admin/DashboardFilter";
import type {
  DepositRequest,
  WithdrawRequest,
} from "@/types";

type AdminModule = {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  badge?: number;
  badgeVariant?:
    | "default"
    | "success"
    | "warning"
    | "destructive"
    | "secondary";
  available: boolean;
};

type PendingPayment = {
  id: string;
  type: "deposit" | "withdraw";
  userName: string;
  amount: number;
  method: string;
  createdAt: string;
};

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [loadTrigger, setLoadTrigger] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingApps, setPendingApps] = useState<BeTutorDetail[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>("month");

  useEffect(() => {
    if (user?.role !== "admin") return;
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);

        const [dashboardStats, pending, deposits, withdrawals] =
          await Promise.all([
            getDashboardStats({ range: timeFilter }),
            getPendingTutors({ page: 1, limit: 10 }),
            getDepositRequests({ status: "Pending" }),
            getWithdrawRequests({ status: "Pending" }),
          ]);

        if (cancelled) return;

        setStats(dashboardStats);
        setPendingApps(pending.tutors.slice(0, 3));

        const allPending: Array<DepositRequest | WithdrawRequest> = [
          ...deposits.slice(0, 3),
          ...withdrawals.slice(0, 2),
        ];
        const userIds = allPending.map((p) => p.userId);
        const nameMap = await getUserNameMap(userIds);

        if (cancelled) return;

        const payments: PendingPayment[] = allPending.map((p) => ({
          id: p.id,
          type: "paymentMethod" in p ? "deposit" : "withdraw",
          userName: nameMap[p.userId] ?? p.userId,
          amount: p.amount,
          method:
            "paymentMethod" in p
              ? (p as DepositRequest).paymentMethod
              : "BANK_TRANSFER",
          createdAt: p.createdAt.slice(0, 10),
        }));
        setPendingPayments(payments);
      } catch (e) {
        if (!cancelled) {
          console.error("Admin dashboard load error:", e);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [user, loadTrigger, timeFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    setLoadTrigger((t) => t + 1);
  };

  const chartData = useMemo(() => {
    if (!stats) {
      return {
        revenueData: [],
        bookingStatusData: [],
        fundAllocationData: [],
      };
    }

    const revenueData = [
      {
        name: "Doanh thu",
        value: stats.system?.platformRevenue ?? 0,
        color: "#2563eb",
      },
      {
        name: "Đang giữ",
        value: stats.system?.activeHoldAmount ?? 0,
        color: "#10b981",
      },
      {
        name: "Chờ nạp",
        value: stats.system?.pendingDepositAmount ?? 0,
        color: "#f59e0b",
      },
      {
        name: "Chờ rút",
        value: stats.system?.pendingWithdrawalAmount ?? 0,
        color: "#ef4444",
      },
    ];

    const bookingStatusData = [
      {
        name: "Đã xác nhận",
        value: stats.bookings.byStatus.Confirmed || 0,
        color: "#2563eb",
      },
      {
        name: "Hoàn thành",
        value: stats.bookings.byStatus.Completed || 0,
        color: "#10b981",
      },
      {
        name: "Đã hủy",
        value: stats.bookings.byStatus.Cancelled || 0,
        color: "#ef4444",
      },
      {
        name: "Chờ duyệt",
        value: stats.bookings.byStatus.Pending || 0,
        color: "#f59e0b",
      },
    ].filter((item) => item.value > 0);

    const fundAllocationData = [
      {
        name: "Doanh thu",
        value: stats.system?.platformRevenue ?? 0,
        color: "#2563eb",
      },
      {
        name: "Đang giữ",
        value: stats.system?.activeHoldAmount ?? 0,
        color: "#10b981",
      },
      {
        name: "Chờ rút",
        value: stats.system?.pendingWithdrawalAmount ?? 0,
        color: "#ef4444",
      },
      {
        name: "Chờ nạp",
        value: stats.system?.pendingDepositAmount ?? 0,
        color: "#f59e0b",
      },
    ].filter((item) => item.value > 0);

    return {
      revenueData,
      bookingStatusData,
      fundAllocationData,
    };
  }, [stats]);

  const ADMIN_MODULES: AdminModule[] = [
    {
      icon: GraduationCap,
      title: "Hồ sơ ứng tuyển",
      description: "Duyệt hồ sơ gia sư mới",
      href: "/admin/applications",
      badge: stats?.applications.pending || 0,
      badgeVariant: "warning",
      available: true,
    },
    {
      icon: CreditCard,
      title: "Quản lý thanh toán",
      description: "Duyệt nạp / rút tiền",
      href: "/admin/payments",
      badge: pendingPayments.length > 0 ? pendingPayments.length : undefined,
      badgeVariant: "warning",
      available: true,
    },
    {
      icon: AlertTriangle,
      title: "Tranh chấp",
      description: "Xử lý khiếu nại buổi học",
      available: false,
    },
    {
      icon: Users,
      title: "Người dùng",
      description: "Quản lý tài khoản hệ thống",
      href: "/admin/users",
      available: true,
    },
    {
      icon: BookOpen,
      title: "Booking",
      description: "Theo dõi booking trên toàn hệ thống",
      href: "/admin/bookings",
      available: true,
    },
    {
      icon: FileText,
      title: "Kiểm duyệt đánh giá",
      description: "Lọc nội dung đánh giá nhạy cảm",
      href: "/admin/reviews",
      available: true,
    },
    {
      icon: Settings,
      title: "Cài đặt hệ thống",
      description: "Fee, policy, notifications",
      href: "/admin/settings",
      available: true,
    },
  ];

  return (
    <main className="min-h-dvh bg-[var(--bg-app)]">
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container space-y-4">
          <header className="pa-hero surface-card bg-gradient-to-br from-white via-white to-primary/5 p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shadow-lg shadow-primary/20">
                  <Shield className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                    Admin Dashboard
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Xin chào{" "}
                    <span className="font-semibold text-foreground">
                      {user?.fullName}
                    </span>
                    , đây là trung tâm vận hành.
                  </p>
                </div>
              </div>
              <div className="pa-hero-actions flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  className="gap-1.5"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Làm mới
                </Button>
                <Badge variant="default" className="h-fit px-3 py-1">
                  Operational Mode
                </Badge>
              </div>
            </div>
          </header>

          {/* Lượt truy cập website (Vercel Analytics) — chỉ admin */}
          <SiteTrafficCard />

          {/* Charts: Trạng thái booking | Tài chính bar | Phân bổ quỹ */}
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <DashboardPieChart
              title="Trạng thái booking"
              data={chartData.bookingStatusData}
              loading={loading}
            />
            <DashboardBarChart
              title="Tài chính (VNĐ)"
              data={chartData.revenueData}
              loading={loading}
              formatValue={(v) => `${v.toLocaleString("vi-VN")} VNĐ`}
            />
            <DashboardPieChart
              title="Phân bổ quỹ"
              data={chartData.fundAllocationData}
              loading={loading}
            />
          </div>

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              {
                key: "users",
                label: "Tổng người dùng",
                value: loading ? "—" : stats?.users.total || 0,
                icon: Users,
                hint: "Tất cả tài khoản",
              },
              {
                key: "apps",
                label: "Hồ sơ chờ duyệt",
                value: loading ? "—" : stats?.applications.pending || 0,
                icon: GraduationCap,
                hint: "Cần xử lý",
                urgent: !loading && (stats?.applications.pending || 0) > 0,
              },
              {
                key: "bookings",
                label: "Booking tháng này",
                value: loading ? "—" : stats?.bookings.total || 0,
                icon: BookOpen,
                hint: "Tháng hiện tại",
              },
              {
                key: "revenue",
                label: "Doanh thu (phí nền tảng)",
                value: loading
                  ? "—"
                  : `${(stats?.bookings.revenue || 0).toLocaleString("vi-VN")} VNĐ`,
                icon: Wallet,
                hint: "Tháng hiện tại",
                compact: true,
              },
            ].map(
              ({ key, label, value, icon: Icon, hint, urgent, compact }) => (
                <article
                  key={key}
                  className={`pa-kpi surface-card p-4 ${urgent ? "border-warning/40 bg-warning/5" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <p className="text-xs font-medium text-muted-foreground">
                      {label}
                    </p>
                    <Icon
                      className={`h-4 w-4 ${urgent ? "text-warning" : "text-muted-foreground"}`}
                    />
                  </div>
                  <p
                    className={`mt-3 font-bold ${compact ? "text-lg" : "text-3xl"} ${urgent ? "text-warning" : "text-foreground"}`}
                  >
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
                </article>
              ),
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Phân tích tài chính</h2>
              <div className="flex items-center gap-2">
                <DashboardFilter selectedFilter={timeFilter} onFilterChange={setTimeFilter} />
                <Button variant="ghost" size="sm" asChild className="gap-1 text-xs">
                  <Link href="/admin/payments">
                    Thanh toán
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Finance number cards */}
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {[
                { key: "platformRevenue", label: "Doanh thu nền tảng", value: stats?.system?.platformRevenue ?? 0, tone: "text-primary" },
                { key: "activeHoldAmount", label: "Đang giữ (booking)", value: stats?.system?.activeHoldAmount ?? 0, tone: "text-foreground" },
                { key: "totalWalletBalance", label: "Tổng số dư ví", value: stats?.system?.totalWalletBalance ?? 0, tone: "text-foreground" },
                {
                  key: "pendingFlow",
                  label: "Chờ nạp / chờ rút",
                  value: `${(stats?.system?.pendingDepositAmount ?? 0).toLocaleString("vi-VN")} / ${(stats?.system?.pendingWithdrawalAmount ?? 0).toLocaleString("vi-VN")}`,
                  tone: "text-warning",
                },
              ].map((item) => (
                <article key={item.key} className="surface-card p-3">
                  <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  <p className={`mt-1.5 text-lg font-bold ${item.tone}`}>
                    {typeof item.value === "number" ? `${item.value.toLocaleString("vi-VN")} VNĐ` : item.value}
                  </p>
                </article>
              ))}
            </div>

          </section>

          {/* Top tutors */}
          <section className="pa-section grid gap-6 lg:grid-cols-2">
            <article className="surface-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4 sm:px-6">
                <BookOpen className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Gia sư được book nhiều nhất</h2>
              </div>
              <div className="divide-y divide-border">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex animate-pulse items-center gap-3 px-5 py-3">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-28 rounded bg-muted" />
                        <div className="h-2.5 w-20 rounded bg-muted" />
                      </div>
                    </div>
                  ))
                ) : !stats?.topTutors?.byBookings?.length ? (
                  <p className="px-5 py-6 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
                ) : (
                  stats.topTutors.byBookings.map((t, i) => (
                    <div key={t.tutorId} className="flex items-center gap-3 px-5 py-3">
                      <span className="w-5 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                      {t.avatarUrl ? (
                        <img src={t.avatarUrl} alt={t.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <AppIcon icon={Star} size="xs" className="fill-warning text-warning" />
                          {t.ratingAvg.toFixed(1)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                        {t.bookingCount} booking
                      </span>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="surface-card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-border px-5 py-4 sm:px-6">
                <Star className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-foreground">Gia sư được đánh giá cao nhất</h2>
              </div>
              <div className="divide-y divide-border">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex animate-pulse items-center gap-3 px-5 py-3">
                      <div className="h-8 w-8 rounded-full bg-muted" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-28 rounded bg-muted" />
                        <div className="h-2.5 w-20 rounded bg-muted" />
                      </div>
                    </div>
                  ))
                ) : !stats?.topTutors?.byRating?.length ? (
                  <p className="px-5 py-6 text-center text-sm text-muted-foreground">Chưa có dữ liệu</p>
                ) : (
                  stats.topTutors.byRating.map((t, i) => (
                    <div key={t.tutorId} className="flex items-center gap-3 px-5 py-3">
                      <span className="w-5 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                      {t.avatarUrl ? (
                        <img src={t.avatarUrl} alt={t.name} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.reviewCount} đánh giá</p>
                      </div>
                      <span className="shrink-0 flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {t.ratingAvg.toFixed(1)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section className="pa-section grid gap-6 lg:grid-cols-2">
            <article className="surface-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Hồ sơ cần duyệt
                  </h2>
                  {!loading && (
                    <Badge variant="warning">{pendingApps.length}</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-1 text-xs"
                >
                  <Link href="/admin/applications">
                    Xem tất cả
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="divide-y divide-border">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex animate-pulse gap-3 px-5 py-3">
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-32 rounded bg-muted" />
                        <div className="h-2.5 w-48 rounded bg-muted" />
                      </div>
                    </div>
                  ))
                ) : pendingApps.length === 0 ? (
                  <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                    Không có hồ sơ nào đang chờ
                  </p>
                ) : (
                  pendingApps.map((application) => (
                    <div
                      key={application.id}
                      className="pa-list-item flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {application.fullName}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock3 className="h-3 w-3" />
                          {(application.subjects?.length ?? 0) > 0
                            ? application.subjects!.join(", ")
                            : "Chờ duyệt hồ sơ"}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs"
                          asChild
                        >
                          <Link href="/admin/applications">
                            <CheckCircle2 className="h-3 w-3" />
                            Xem & duyệt
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="surface-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Giao dịch cần xử lý
                  </h2>
                  {!loading && pendingPayments.length > 0 && (
                    <Badge variant="warning">{pendingPayments.length}</Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="gap-1 text-xs"
                >
                  <Link href="/admin/payments">
                    Xem tất cả
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>

              <div className="divide-y divide-border">
                {loading ? (
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex animate-pulse gap-3 px-5 py-3">
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-36 rounded bg-muted" />
                        <div className="h-2.5 w-52 rounded bg-muted" />
                      </div>
                    </div>
                  ))
                ) : pendingPayments.length === 0 ? (
                  <p className="px-5 py-6 text-center text-sm text-muted-foreground">
                    Không có giao dịch nào đang chờ
                  </p>
                ) : (
                  pendingPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="pa-list-item flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-foreground">
                            {payment.userName}
                          </p>
                          <Badge
                            variant={
                              payment.type === "deposit" ? "success" : "warning"
                            }
                          >
                            {payment.type === "deposit"
                              ? "Nạp tiền"
                              : "Rút tiền"}
                          </Badge>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {payment.amount.toLocaleString("vi-VN")} VNĐ ·{" "}
                          {payment.method} · {payment.createdAt}
                        </p>
                      </div>
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          className="h-7 gap-1 px-2 text-xs"
                          asChild
                        >
                          <Link href="/admin/payments">
                            <CheckCircle2 className="h-3 w-3" />
                            Xử lý
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 px-2 text-xs"
                          asChild
                        >
                          <Link href="/admin/payments">
                            <XCircle className="h-3 w-3" />
                            Từ chối
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>
          </section>

          <section className="pa-section">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Module quản trị
              </h2>
              <Badge variant="secondary">
                {ADMIN_MODULES.filter((m) => m.available).length} module live
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {ADMIN_MODULES.map((module) => {
                const cardClassName =
                  "surface-card group relative overflow-hidden p-5 transition-all " +
                  (module.available
                    ? "hover:border-primary/40 hover:shadow-md"
                    : "opacity-80");

                const content = (
                  <>
                    <div
                      className={`mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl ${module.available ? "bg-primary/10" : "bg-muted"}`}
                    >
                      <module.icon
                        className={`h-6 w-6 ${module.available ? "text-primary" : "text-muted-foreground"}`}
                      />
                    </div>
                    {module.badge != null && module.badge > 0 && (
                      <Badge
                        variant={module.badgeVariant ?? "default"}
                        className="absolute right-3 top-3 text-xs"
                      >
                        {module.badge}
                      </Badge>
                    )}
                    {!module.available && (
                      <Badge
                        variant="secondary"
                        className="absolute right-3 top-3 text-xs"
                      >
                        Soon
                      </Badge>
                    )}
                    <h3 className="text-sm font-bold text-foreground">
                      {module.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {module.description}
                    </p>
                  </>
                );

                if (!module.available || !module.href) {
                  return (
                    <div
                      key={module.title}
                      className={`pa-list-item ${cardClassName}`}
                      aria-disabled="true"
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <Link
                    key={module.title}
                    href={module.href}
                    className={`pa-list-item ${cardClassName}`}
                  >
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
