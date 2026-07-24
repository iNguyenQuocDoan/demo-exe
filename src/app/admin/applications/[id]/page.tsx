"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  DollarSign,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Star,
  User,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CertificateViewer,
  certificateFileName,
} from "@/components/shared/CertificateViewer";
import {
  getPendingTutorDetail,
  approveTutor,
  rejectTutor,
  type BeTutorDetail,
  type TutorVerificationStatus,
} from "@/api/tutorApi";
import { useAuthStore } from "@/store/useAuthStore";

function avatarFallback(id: string) {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(id)}`;
}

const GENDER_LABEL: Record<string, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

const VERIFY_STATUS_LABEL: Record<TutorVerificationStatus, { label: string; color: string }> = {
  NOT_VERIFIED: { label: "Chưa xác minh", color: "text-slate-600" },
  PENDING: { label: "Đang chờ duyệt", color: "text-amber-600" },
  APPROVED: { label: "Đã được duyệt", color: "text-emerald-600" },
  REJECTED: { label: "Bị từ chối", color: "text-destructive" },
};

export default function AdminApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const id = params?.id as string;

  const [profile, setProfile] = useState<BeTutorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Action state
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Chỉ số tài liệu đang mở trong modal xem bằng cấp (null = đóng)
  const [certIndex, setCertIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setFetchError("");
    const data = await getPendingTutorDetail(id);
    if (!data) {
      setFetchError("Không tìm thấy hồ sơ hoặc đã được xử lý.");
    }
    setProfile(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (isLoading || !user) return;
    void load();
  }, [isLoading, user, load]);

  const handleApprove = async () => {
    if (!confirm("Bạn có chắc muốn duyệt hồ sơ gia sư này không?")) return;
    setBusy(true);
    setActionError("");
    const res = await approveTutor(id);
    setBusy(false);
    if (res.ok) {
      setSuccessMsg("✓ Đã duyệt hồ sơ gia sư");
      setTimeout(() => router.push("/admin/applications"), 1500);
    } else {
      setActionError(res.error ?? "Không thể duyệt gia sư");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setActionError("Vui lòng nhập lý do từ chối.");
      return;
    }
    setBusy(true);
    setActionError("");
    const res = await rejectTutor(id, rejectReason.trim());
    setBusy(false);
    if (res.ok) {
      setSuccessMsg("Đã từ chối hồ sơ gia sư");
      setTimeout(() => router.push("/admin/applications"), 1500);
    } else {
      setActionError(res.error ?? "Không thể từ chối gia sư");
    }
  };

  // Loading skeleton
  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container max-w-3xl space-y-4">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }

  // Error state
  if (fetchError || !profile) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container max-w-3xl space-y-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/applications">
                <ArrowLeft className="h-4 w-4 mr-1" /> Quay lại danh sách
              </Link>
            </Button>
            <div className="surface-card py-16 text-center">
              <p className="text-muted-foreground">
                {fetchError || "Không tìm thấy hồ sơ."}
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const verStatus = profile.verificationStatus ?? "NOT_VERIFIED";
  const verMeta = VERIFY_STATUS_LABEL[verStatus] ?? VERIFY_STATUS_LABEL.NOT_VERIFIED;

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container max-w-3xl space-y-4">
          {/* Nav */}
          <div className="flex items-center justify-between gap-3">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/applications">
                <ArrowLeft className="h-4 w-4 mr-1" /> Danh sách chờ duyệt
              </Link>
            </Button>
          </div>

          {/* Success notification */}
          {successMsg && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 text-sm font-medium">
              <CheckCircle2 className="h-4 w-4" />
              {successMsg}
            </div>
          )}

          {/* Profile header card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-5">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-border bg-muted">
                  <Image
                    src={profile.avatarUrl || avatarFallback(profile.id)}
                    alt={profile.fullName ?? "Gia sư"}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">
                      {profile.fullName || "Gia sư"}
                    </h1>
                    <span className={`text-sm font-semibold ${verMeta.color}`}>
                      {verMeta.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.id}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                    {profile.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-4 w-4" /> {profile.email}
                      </span>
                    )}
                    {profile.phoneNumber && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="h-4 w-4" /> {profile.phoneNumber}
                      </span>
                    )}
                    {profile.rating != null && profile.rating > 0 && (
                      <span className="inline-flex items-center gap-1.5 text-amber-600">
                        <Star className="h-4 w-4 fill-amber-400" /> {profile.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-primary" /> Thông tin cá nhân
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Giới tính</dt>
                  <dd className="font-medium">{GENDER_LABEL[profile.gender ?? ""] ?? profile.gender ?? "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Ngày sinh</dt>
                  <dd className="font-medium">
                    {profile.dob
                      ? new Date(profile.dob).toLocaleDateString("vi-VN")
                      : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> Tỉnh/Thành
                  </dt>
                  <dd className="font-medium">{profile.city || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Quận/Huyện</dt>
                  <dd className="font-medium">{profile.district || "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Địa chỉ chi tiết</dt>
                  <dd className="font-medium">{profile.detail || "—"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Academic & Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="h-4 w-4 text-primary" /> Học vấn & Kinh nghiệm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Cấp học / Trình độ</dt>
                  <dd className="font-medium">{profile.academicLevel || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Chuyên ngành</dt>
                  <dd className="font-medium">{profile.major || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Bằng cấp / Trường</dt>
                  <dd className="font-medium">{profile.education || "—"}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground flex items-center gap-1">
                    <UserCheck className="h-3 w-3" /> Kinh nghiệm
                  </dt>
                  <dd className="font-medium">
                    {profile.experience != null ? `${profile.experience} năm` : "—"}
                  </dd>
                </div>
                {profile.description && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Giới thiệu bản thân</dt>
                    <dd className="mt-1 text-muted-foreground">{profile.description}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Subjects & Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpen className="h-4 w-4 text-primary" /> Môn dạy & Học phí
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(profile.subjects?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.subjects!.map((s) => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                </div>
              )}
              {profile.hourlyRate != null && (
                <p className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <DollarSign className="h-4 w-4" />
                  {profile.hourlyRate.toLocaleString("vi-VN")} VNĐ / giờ
                </p>
              )}
            </CardContent>
          </Card>

          {/* Certificates */}
          {(profile.certificateUrls?.length ?? 0) > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4 text-primary" /> Bằng cấp &amp; chứng chỉ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3 text-xs text-muted-foreground">
                  Bấm vào tài liệu để xem phóng to trước khi duyệt hồ sơ.
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {profile.certificateUrls!.map((url, i) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setCertIndex(i)}
                      className="group overflow-hidden rounded-lg border border-border text-left transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                      <div className="flex h-28 items-center justify-center bg-muted/50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={certificateFileName(url)}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      </div>
                      <span className="block truncate px-2 py-1.5 text-xs text-muted-foreground group-hover:text-foreground">
                        {certificateFileName(url)}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection reason (if any) */}
          {verStatus === "REJECTED" && profile.rejectionReason && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm font-semibold text-destructive flex items-center gap-1.5">
                  <XCircle className="h-4 w-4" /> Lý do từ chối trước đó
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{profile.rejectionReason}</p>
              </CardContent>
            </Card>
          )}

          {/* Admin actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hành động admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {successMsg ? (
                <p className="text-sm text-emerald-600 font-medium">{successMsg}</p>
              ) : action === "reject" ? (
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Lý do từ chối <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => { setRejectReason(e.target.value); setActionError(""); }}
                    rows={3}
                    placeholder="Nhập lý do từ chối để gia sư biết cần bổ sung gì…"
                    className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {actionError && (
                    <p className="text-xs text-destructive">{actionError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      loading={busy}
                      disabled={busy}
                      onClick={() => void handleReject()}
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Xác nhận từ chối
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={busy}
                      onClick={() => { setAction(null); setActionError(""); }}
                    >
                      Huỷ
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {actionError && (
                    <p className="text-sm text-destructive">{actionError}</p>
                  )}
                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="gap-2"
                      loading={busy}
                      disabled={busy}
                      onClick={() => void handleApprove()}
                    >
                      <CheckCircle2 className="h-4 w-4" /> Duyệt hồ sơ
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 border-destructive/40 text-destructive hover:bg-destructive/5"
                      disabled={busy}
                      onClick={() => setAction("reject")}
                    >
                      <XCircle className="h-4 w-4" /> Từ chối
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pb-4">
            <Calendar className="h-3.5 w-3.5" />
            ID hồ sơ: {profile.id}
          </div>
        </div>
      </section>

      <CertificateViewer
        urls={profile.certificateUrls ?? []}
        index={certIndex}
        onIndexChange={setCertIndex}
        onClose={() => setCertIndex(null)}
      />
    </main>
  );
}
