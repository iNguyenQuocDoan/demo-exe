"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, DollarSign, Flag, ReceiptText, Users } from "lucide-react";
import { getBookings } from "@/api/bookingApi";
import { getDashboardStats, type DashboardStats } from "@/api/statsApi";
import { getAllTutorApplications } from "@/api/tutorApplicationApi";
import { getDepositRequests, getWithdrawRequests } from "@/api/walletApi";
import { getReports } from "@/api/reportApi";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import type { Booking, DepositRequest, TutorApplication, WithdrawRequest } from "@/types";

export default function AdminReportsPage() {
  const { user, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>([]);
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [pendingDisputeCount, setPendingDisputeCount] = useState(0);

  useEffect(() => {
    if (isLoading || !user) return;

    let mounted = true;
    setLoading(true);

    Promise.all([
      getDashboardStats(),
      getBookings({}),
      getDepositRequests(),
      getWithdrawRequests(),
      getAllTutorApplications(),
      getReports({ status: "Pending" }),
    ])
      .then(([dashboardStats, bookingsData, depositData, withdrawalData, appData, pendingReports]) => {
        if (!mounted) return;
        setStats(dashboardStats);
        setBookings(bookingsData);
        setDeposits(depositData);
        setWithdrawals(withdrawalData);
        setApplications(appData);
        setPendingDisputeCount(pendingReports.total);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [isLoading, user]);

  const metrics = useMemo(() => {
    const completedBookings = bookings.filter((item) => item.status === "Completed");
    const confirmedBookings = bookings.filter((item) => item.status === "Confirmed");

    const grossRevenue = completedBookings.reduce((sum, item) => sum + item.totalAmount, 0);
    const platformRevenue = completedBookings.reduce((sum, item) => sum + item.platformFee, 0);

    const pendingApplications = applications.filter((item) => item.status === "Submitted" || item.status === "Reviewing").length;

    const depositsCompleted = deposits
      .filter((item) => item.status === "Completed")
      .reduce((sum, item) => sum + Math.max(item.amount, 0), 0);

    return {
      userTotal: stats?.users.total ?? 0,
      bookingsTotal: bookings.length,
      confirmedBookings: confirmedBookings.length,
      completedBookings: completedBookings.length,
      grossRevenue,
      platformRevenue,
      pendingApplications,
      depositsCompleted,
      requestsTotal: deposits.length + withdrawals.length,
    };
  }, [applications, bookings, deposits, stats?.users.total, withdrawals.length]);

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container space-y-5">
          <header className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Báo cáo hệ thống</h1>
                <p className="text-sm text-muted-foreground">Tổng hợp chỉ số vận hành và tài chính từ dữ liệu hệ thống thật.</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/admin">Quay lại dashboard</Link>
              </Button>
            </div>
          </header>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <article className="surface-card p-4">
              <p className="text-xs text-muted-foreground">Tổng người dùng</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{metrics.userTotal}</p>
              <Users className="mt-2 h-4 w-4 text-primary" />
            </article>
            <article className="surface-card p-4">
              <p className="text-xs text-muted-foreground">Tổng booking</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{metrics.bookingsTotal}</p>
              <BarChart3 className="mt-2 h-4 w-4 text-primary" />
            </article>
            <article className="surface-card p-4">
              <p className="text-xs text-muted-foreground">Doanh thu gộp (completed)</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(metrics.grossRevenue)}</p>
              <DollarSign className="mt-2 h-4 w-4 text-primary" />
            </article>
            <article className="surface-card p-4">
              <p className="text-xs text-muted-foreground">Phí nền tảng</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(metrics.platformRevenue)}</p>
              <ReceiptText className="mt-2 h-4 w-4 text-primary" />
            </article>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <article className="surface-card p-5">
              <h2 className="text-base font-semibold text-foreground">Vận hành booking</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lịch đã xác nhận</span>
                  <span className="font-semibold text-foreground">{metrics.confirmedBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lịch đã hoàn thành</span>
                  <span className="font-semibold text-foreground">{metrics.completedBookings}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hồ sơ gia sư pending</span>
                  <span className="font-semibold text-foreground">{metrics.pendingApplications}</span>
                </div>
              </div>
            </article>

            <article className="surface-card p-5">
              <h2 className="text-base font-semibold text-foreground">Dòng tiền</h2>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tổng nạp đã duyệt</span>
                  <span className="font-semibold text-foreground">{formatCurrency(metrics.depositsCompleted)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tổng yêu cầu nạp/rút</span>
                  <span className="font-semibold text-foreground">{metrics.requestsTotal}</span>
                </div>
              </div>
            </article>
          </section>

          {/* Quick link to disputes */}
          <article className="surface-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 shrink-0">
                  <Flag className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Tranh chấp & Báo cáo</p>
                  <p className="text-xs text-muted-foreground">
                    {pendingDisputeCount > 0
                      ? `${pendingDisputeCount} báo cáo đang chờ xử lý`
                      : "Không có báo cáo nào đang chờ xử lý"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {pendingDisputeCount > 0 && (
                  <Badge variant="destructive">{pendingDisputeCount}</Badge>
                )}
                <Button asChild size="sm" variant={pendingDisputeCount > 0 ? "default" : "outline"}>
                  <Link href="/admin/disputes">Xem báo cáo</Link>
                </Button>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
