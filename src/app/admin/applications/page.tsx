"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Star,
  UserCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PROFILE_STATUS_META } from "@/lib/statusMeta";
import { getPendingTutors, approveTutor, rejectTutor } from "@/api/tutorApi";
import { useAuthStore } from "@/store/useAuthStore";
import type { TutorProfile } from "@/types";

function PendingTutorCard({
  tutor,
  onDone,
}: {
  tutor: TutorProfile;
  onDone: () => void;
}) {
  const [action, setAction] = useState<"reject" | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleApprove = async () => {
    setBusy(true);
    setError("");
    const res = await approveTutor(tutor.id);
    setBusy(false);
    if (res.ok) onDone();
    else setError(res.error ?? "Không thể duyệt gia sư.");
  };

  const handleReject = async () => {
    setBusy(true);
    setError("");
    const res = await rejectTutor(tutor.id, reason.trim() || "Hồ sơ chưa đạt yêu cầu");
    setBusy(false);
    if (res.ok) onDone();
    else setError(res.error ?? "Không thể từ chối gia sư.");
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-muted">
            <Image
              src={tutor.avatarUrl}
              alt={tutor.fullName}
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
              <StatusBadge registry={PROFILE_STATUS_META} value="PendingReview" />
              {tutor.ratingAvg > 0 && (
                <span className="inline-flex items-center gap-0.5 text-xs text-amber-600">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {tutor.ratingAvg.toFixed(1)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {tutor.education && (
                <span className="inline-flex items-center gap-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {tutor.education}
                </span>
              )}
              {tutor.experience && (
                <span className="inline-flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5" />
                  {tutor.experience}
                </span>
              )}
              <span className="font-medium text-primary">
                {tutor.pricePerHour.toLocaleString("vi-VN")} VNĐ/giờ
              </span>
            </div>
          </div>
        </div>

        {tutor.bio && (
          <p className="text-sm text-muted-foreground line-clamp-3">{tutor.bio}</p>
        )}

        {tutor.subjects.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
            {tutor.subjects.map((s) => (
              <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
            ))}
          </div>
        )}

        {action === "reject" ? (
          <div className="space-y-2 border-t border-border pt-3">
            <label className="text-xs font-medium text-muted-foreground">Lý do từ chối</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Nhập lý do để gia sư biết cần bổ sung gì…"
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2">
              <Button size="sm" variant="destructive" loading={busy} onClick={handleReject}>
                <XCircle className="h-3.5 w-3.5" /> Xác nhận từ chối
              </Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => setAction(null)}>
                Huỷ
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 border-t border-border pt-3">
            <Button size="sm" className="gap-1.5" loading={busy} onClick={handleApprove}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Duyệt
            </Button>
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

export default function AdminApplicationsPage() {
  const { user, isLoading } = useAuthStore();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // BE: GET /api/tutors/pending — gia sư có hồ sơ chờ admin duyệt.
      const { tutors } = await getPendingTutors({ page: 1, limit: 100 });
      setTutors(tutors);
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

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-44 rounded-2xl" />
              ))}
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
