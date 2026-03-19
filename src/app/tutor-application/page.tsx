"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock3, FileText, RefreshCcw, XCircle } from "lucide-react";
import { getTutorApplication, getTutorApplicationByUserId } from "@/api/tutorApplicationApi";
import { getMe } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";
import type { TutorApplicationStatus } from "@/types";

const STATUS_META: Record<TutorApplicationStatus, { title: string; desc: string; icon: typeof Clock3; tone: string }> = {
  Submitted: {
    title: "Hồ sơ đã được gửi",
    desc: "Hệ thống đã tiếp nhận hồ sơ của bạn. Admin sẽ xem xét trong 1-3 ngày làm việc.",
    icon: Clock3,
    tone: "text-sky-600",
  },
  Reviewing: {
    title: "Đang được xem xét",
    desc: "Hồ sơ đang trong quá trình kiểm duyệt và đối chiếu thông tin.",
    icon: FileText,
    tone: "text-amber-600",
  },
  Approved: {
    title: "Hồ sơ được phê duyệt",
    desc: "Chúc mừng! Tài khoản của bạn đã có quyền gia sư. Nhấn nút bên dưới để vào dashboard.",
    icon: CheckCircle2,
    tone: "text-emerald-600",
  },
  Rejected: {
    title: "Hồ sơ chưa đạt",
    desc: "Hồ sơ cần cập nhật lại theo ghi chú admin trước khi gửi lại.",
    icon: XCircle,
    tone: "text-destructive",
  },
  ReSubmit: {
    title: "Cần bổ sung thông tin",
    desc: "Admin yêu cầu bổ sung tài liệu/dữ liệu để tiếp tục xét duyệt.",
    icon: RefreshCcw,
    tone: "text-orange-600",
  },
};

export default function TutorApplicationStatusPage() {
  const router = useRouter();
  const { user, isLoading, login: storeLogin } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [application, setApplication] = useState<Awaited<ReturnType<typeof getTutorApplication>>>(null);

  useEffect(() => {
    if (isLoading || !user) return;

    let mounted = true;
    setLoading(true);

    const load = async () => {
      if (user.tutorApplicationId) {
        const data = await getTutorApplication(user.tutorApplicationId);
        if (mounted) setApplication(data);
      } else {
        const data = await getTutorApplicationByUserId();
        if (mounted) setApplication(data);
      }
      if (mounted) setLoading(false);
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [isLoading, user]);

  // When approved: fetch fresh user from backend, update store + cookie, then navigate
  const handleEnterTutorDashboard = async () => {
    setRefreshing(true);
    try {
      const freshUser = await getMe();
      if (freshUser) {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_user", JSON.stringify(freshUser));
        }
        storeLogin(freshUser);
        document.cookie = `auth_role=${freshUser.role}; path=/; SameSite=Strict; max-age=86400`;
      }
      router.push("/dashboard/tutor");
    } finally {
      setRefreshing(false);
    }
  };

  const status = useMemo(() => application?.status ?? "Submitted", [application?.status]);
  const meta = STATUS_META[status];
  const StatusIcon = meta.icon;

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-[var(--bg-app)]">
        <section className="section-space-tight">
          <div className="site-container max-w-3xl space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }


  return (
    <main className="min-h-dvh bg-[var(--bg-app)]">
      <section className="section-space-tight">
        <div className="site-container max-w-3xl space-y-5">
          <header className="surface-card p-5 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground">Trạng thái hồ sơ gia sư</h1>
            <p className="text-sm text-muted-foreground">Theo dõi quá trình duyệt hồ sơ và cập nhật khi cần.</p>
          </header>

          {!application ? (
            <Card className="surface-card">
              <CardContent className="p-8 text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <h2 className="mt-4 text-lg font-semibold text-foreground">Bạn chưa gửi hồ sơ gia sư</h2>
                <p className="mt-2 text-sm text-muted-foreground">Tạo hồ sơ để bắt đầu quy trình xét duyệt.</p>
                <Button asChild className="mt-5">
                  <Link href="/apply-tutor">Đăng ký làm gia sư</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="surface-card">
              <CardContent className="p-6 sm:p-8">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-muted p-3">
                    <StatusIcon className={`h-6 w-6 ${meta.tone}`} />
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${meta.tone}`}>{meta.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{meta.desc}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 rounded-xl border border-border p-4 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Mã hồ sơ</p>
                    <p className="font-mono text-foreground">{application.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Ngày gửi</p>
                    <p className="text-foreground">{new Date(application.submittedAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Trạng thái</p>
                    <p className="text-foreground">{application.status}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Người duyệt</p>
                    <p className="text-foreground">{application.reviewedBy ?? "Chưa có"}</p>
                  </div>
                </div>

                {application.adminNotes && (
                  <div className="mt-4 rounded-xl border border-warning/30 bg-warning/5 p-4 text-sm text-foreground">
                    <p className="font-semibold">Ghi chú admin</p>
                    <p className="mt-1 text-muted-foreground">{application.adminNotes}</p>
                  </div>
                )}

                {application.rejectionReason && (
                  <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
                    <p className="font-semibold text-destructive">Lý do từ chối</p>
                    <p className="mt-1 text-muted-foreground">{application.rejectionReason}</p>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap gap-2">
                  {(status === "Rejected" || status === "ReSubmit") && (
                    <Button asChild>
                      <Link href="/apply-tutor?resubmit=true">Cập nhật hồ sơ</Link>
                    </Button>
                  )}

                  {status === "Approved" && (
                    <Button onClick={handleEnterTutorDashboard} loading={refreshing}>
                      Vào dashboard gia sư
                    </Button>
                  )}

                  <Button asChild variant="outline">
                    <Link href="/dashboard/tutor-candidate">Quay lại dashboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
