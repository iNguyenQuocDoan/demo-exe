"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPendingTutors, approveTutor, rejectTutor, type BeTutorDetail } from "@/api/tutorApi";
import { useAuthStore } from "@/store/useAuthStore";

// ── Avatar fallback ───────────────────────────────────────────────────────────
function avatarFallback(id: string) {
  return `https://api.dicebear.com/7.x/avataaars/png?seed=${encodeURIComponent(id)}`;
}

// ── PendingTutorCard ──────────────────────────────────────────────────────────
function PendingTutorCard({
  tutor,
  onDone,
}: {
  tutor: BeTutorDetail;
  onDone: () => void;
}) {
  const [action, setAction] = useState<"reject" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    if (!confirm("Bạn có chắc muốn duyệt hồ sơ gia sư này không?")) return;
    setBusy(true);
    setError("");
    const res = await approveTutor(tutor.id);
    setBusy(false);
    if (res.ok) onDone();
    else setError(res.error ?? "Không thể duyệt gia sư.");
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }
    setBusy(true);
    setError("");
    const res = await rejectTutor(tutor.id, reason.trim());
    setBusy(false);
    if (res.ok) onDone();
    else setError(res.error ?? "Không thể từ chối gia sư.");
  };

  const avatarSrc = tutor.avatarUrl || avatarFallback(tutor.id);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        {/* Header: avatar + basic info */}
        <div className="flex items-start gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            <Image
              src={avatarSrc}
              alt={tutor.fullName ?? "Gia sư"}
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-foreground">
                {tutor.fullName || "Gia sư"}
              </h3>
              <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                Chờ duyệt
              </Badge>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {tutor.email && (
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {tutor.email}
                </span>
              )}
              {tutor.phoneNumber && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {tutor.phoneNumber}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {tutor.academicLevel && (
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {tutor.academicLevel}
                  {tutor.major ? ` – ${tutor.major}` : ""}
                </span>
              )}
              {tutor.experience != null && (
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" />
                  {tutor.experience} năm kinh nghiệm
                </span>
              )}
              {(tutor.city || tutor.district) && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[tutor.district, tutor.city].filter(Boolean).join(", ")}
                </span>
              )}
              {tutor.hourlyRate != null && (
                <span className="font-medium text-primary">
                  {tutor.hourlyRate.toLocaleString("vi-VN")} VNĐ/giờ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {tutor.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">{tutor.description}</p>
        )}

        {/* Subjects */}
        {(tutor.subjects?.length ?? 0) > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            {tutor.subjects!.map((s) => (
              <Badge key={s} variant="outline" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        )}

        {/* Reject form or action buttons */}
        {action === "reject" ? (
          <div className="space-y-2 border-t border-border pt-3">
            <label className="text-xs font-medium text-muted-foreground">
              Lý do từ chối <span className="text-destructive">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError(""); }}
              rows={2}
              placeholder="Nhập lý do để gia sư biết cần bổ sung gì…"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                loading={busy}
                disabled={busy}
                onClick={() => void handleReject()}
              >
                <XCircle className="h-3.5 w-3.5" /> Xác nhận từ chối
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={() => { setAction(null); setError(""); }}
              >
                Huỷ
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            {/* View detail */}
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <Link href={`/admin/applications/${tutor.id}`}>
                <Eye className="h-3.5 w-3.5" /> Xem chi tiết
              </Link>
            </Button>
            {/* Approve */}
            <Button size="sm" className="gap-1.5" loading={busy} disabled={busy} onClick={() => void handleApprove()}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Duyệt
            </Button>
            {/* Reject */}
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/5"
              disabled={busy}
              onClick={() => setAction("reject")}
            >
              <XCircle className="h-3.5 w-3.5" /> Từ chối
            </Button>
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminApplicationsPage() {
  const { user, isLoading } = useAuthStore();
  const [tutors, setTutors] = useState<BeTutorDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const { tutors: data } = await getPendingTutors({ page: 1, limit: 100 });
      setTutors(data);
    } catch {
      setFetchError("Không thể tải danh sách hồ sơ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    void load();
  }, [isLoading, user, load]);

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container max-w-3xl space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <UserCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Duyệt hồ sơ gia sư</h1>
                <p className="text-sm text-muted-foreground">
                  {loading ? "Đang tải…" : `${tutors.length} hồ sơ chờ duyệt`}
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/admin">
                <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
              </Link>
            </Button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
            </div>
          ) : fetchError ? (
            <div className="surface-card flex flex-col items-center gap-3 py-16 text-center">
              <p className="text-sm text-destructive">{fetchError}</p>
              <Button size="sm" variant="outline" onClick={() => void load()}>
                Thử lại
              </Button>
            </div>
          ) : tutors.length === 0 ? (
            <div className="surface-card flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <UserCheck className="h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">Không có hồ sơ gia sư nào chờ duyệt.</p>
              <p className="text-xs">Khi gia sư hoàn tất hồ sơ, chúng sẽ xuất hiện ở đây.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tutors.map((t) => (
                <PendingTutorCard key={t.id} tutor={t} onDone={() => void load()} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
