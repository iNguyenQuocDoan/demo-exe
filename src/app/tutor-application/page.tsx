"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCcw,
  XCircle,
} from "lucide-react";
import { getMyTutorProfile, type BeTutorDetail, type TutorVerificationStatus } from "@/api/tutorApi";
import { getMe } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/useAuthStore";

// Map verificationStatus (backend field) → UI meta
const STATUS_META: Record<
  TutorVerificationStatus,
  {
    title: string;
    desc: string;
    icon: typeof Clock3;
    tone: string;
  }
> = {
  NOT_VERIFIED: {
    title: "Chưa xác minh",
    desc: "Bạn chưa gửi hoặc chưa hoàn thiện hồ sơ đăng ký làm gia sư.",
    icon: AlertCircle,
    tone: "text-slate-500",
  },
  PENDING: {
    title: "Hồ sơ đang chờ admin duyệt",
    desc: "Hệ thống đã tiếp nhận hồ sơ của bạn. Admin sẽ xem xét trong 1-3 ngày làm việc.",
    icon: Clock3,
    tone: "text-sky-600",
  },
  APPROVED: {
    title: "Hồ sơ gia sư đã được duyệt",
    desc: "Chúc mừng! Hồ sơ của bạn đã được phê duyệt. Bạn có thể hoạt động với tư cách gia sư.",
    icon: CheckCircle2,
    tone: "text-emerald-600",
  },
  REJECTED: {
    title: "Hồ sơ bị từ chối",
    desc: "Hồ sơ của bạn chưa đạt yêu cầu. Xem lý do bên dưới và cập nhật lại hồ sơ.",
    icon: XCircle,
    tone: "text-destructive",
  },
};

// Fallback nếu verificationStatus không thuộc enum
const UNKNOWN_META = {
  title: "Chưa có trạng thái hồ sơ",
  desc: "Hồ sơ chưa được khởi tạo hoặc đang cập nhật.",
  icon: FileText,
  tone: "text-muted-foreground",
};

export default function TutorApplicationStatusPage() {
  const router = useRouter();
  const { user, isLoading, login: storeLogin } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<BeTutorDetail | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    const data = await getMyTutorProfile();
    setProfile(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    void loadProfile();
  }, [isLoading, user, loadProfile]);

  // Khi APPROVED: fetch user mới từ BE, cập nhật store + cookie, chuyển trang
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

  // Không có profile → chưa nộp hồ sơ lần nào
  if (!profile) {
    return (
      <main className="min-h-dvh bg-[var(--bg-app)]">
        <section className="section-space-tight">
          <div className="site-container max-w-3xl space-y-5">
            <header className="surface-card p-5 sm:p-6">
              <h1 className="text-2xl font-bold text-foreground">Trạng thái hồ sơ gia sư</h1>
              <p className="text-sm text-muted-foreground">Theo dõi quá trình duyệt hồ sơ và cập nhật khi cần.</p>
            </header>
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
          </div>
        </section>
      </main>
    );
  }

  // verificationStatus từ backend
  const verStatus: TutorVerificationStatus = profile.verificationStatus ?? "NOT_VERIFIED";
  const meta = STATUS_META[verStatus] ?? UNKNOWN_META;
  const StatusIcon = meta.icon;

  return (
    <main className="min-h-dvh bg-[var(--bg-app)]">
      <section className="section-space-tight">
        <div className="site-container max-w-3xl space-y-5">
          <header className="surface-card p-5 sm:p-6">
            <h1 className="text-2xl font-bold text-foreground">Trạng thái hồ sơ gia sư</h1>
            <p className="text-sm text-muted-foreground">Theo dõi quá trình duyệt hồ sơ và cập nhật khi cần.</p>
          </header>

          <Card className="surface-card">
            <CardContent className="p-6 sm:p-8">
              {/* Status banner */}
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-muted p-3">
                  <StatusIcon className={`h-6 w-6 ${meta.tone}`} />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${meta.tone}`}>{meta.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{meta.desc}</p>
                </div>
              </div>

              {/* Profile info */}
              <div className="mt-6 grid gap-3 rounded-xl border border-border p-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Họ tên</p>
                  <p className="font-medium text-foreground">{profile.fullName ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-foreground">{profile.email ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trạng thái xác minh</p>
                  <p className={`font-semibold ${meta.tone}`}>{verStatus}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Trình độ học vấn</p>
                  <p className="text-foreground">{profile.academicLevel ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Chuyên ngành</p>
                  <p className="text-foreground">{profile.major ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kinh nghiệm</p>
                  <p className="text-foreground">
                    {profile.experience != null ? `${profile.experience} năm` : "—"}
                  </p>
                </div>
              </div>

              {/* Rejection reason — bắt buộc hiển thị nếu bị từ chối */}
              {verStatus === "REJECTED" && profile.rejectionReason && (
                <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-foreground">
                  <p className="font-semibold text-destructive">Lý do từ chối</p>
                  <p className="mt-1 text-muted-foreground">{profile.rejectionReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-wrap gap-2">
                {(verStatus === "REJECTED" || verStatus === "NOT_VERIFIED") && (
                  <Button asChild>
                    <Link href="/apply-tutor">
                      {verStatus === "REJECTED" ? (
                        <><RefreshCcw className="h-4 w-4 mr-1.5" /> Cập nhật & Gửi lại hồ sơ</>
                      ) : (
                        "Đăng ký làm gia sư"
                      )}
                    </Link>
                  </Button>
                )}

                {verStatus === "PENDING" && (
                  <Button asChild variant="outline">
                    <Link href="/apply-tutor">
                      <FileText className="h-4 w-4 mr-1.5" /> Xem / Cập nhật hồ sơ
                    </Link>
                  </Button>
                )}

                {verStatus === "APPROVED" && (
                  <Button onClick={handleEnterTutorDashboard} loading={refreshing}>
                    Vào dashboard gia sư
                  </Button>
                )}

                <Button asChild variant="outline">
                  <Link href="/dashboard/parent">Quay lại dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
