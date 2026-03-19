"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Flag, MessageSquare, PencilLine, ShieldCheck } from "lucide-react";
import {
  confirmBookingAndUnlock,
  confirmCompletion,
  getEnhancedBookingDetail,
  getLatestOwnerChange,
  savePlanDraft,
  sendPlan,
  type SavePlanInput,
} from "@/api/bookingEnhancedApi";
import { buildConvId } from "@/api/chatApi";
import {
  formatContactOwnerRole,
  isSensitiveInfoVisible,
} from "@/lib/bookingEnhancedMock";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookingFlowBadge,
  BookingMetaRow,
  BookingStatusTimeline,
  CompletionConfirmCard,
  ContactMethodCard,
  ContactOwnerCard,
  LocationCard,
  ParentPreferencesCard,
  PrivacyNotice,
  StudyPlanCard,
} from "@/components/booking/EnhancedBookingBlocks";
import { StudyPlanEditorDialog } from "@/components/booking/StudyPlanEditorDialog";
import { BookingGoalCard } from "@/components/booking/BookingGoalCard";
import { ReportDisputeModal } from "@/components/booking/ReportDisputeModal";
import { BookingReportsList } from "@/components/booking/BookingReportsList";

export default function TutorBookingDetailPage() {
  const params = useParams<{ id: string }>();
  const bookingId = useMemo(
    () => (Array.isArray(params?.id) ? params.id[0] : params?.id),
    [params],
  );

  const { user, isLoading } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportRefreshKey, setReportRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getEnhancedBookingDetail>>>(null);

  const tutorId = user?.tutorProfileId;

  const load = useCallback(async () => {
    if (!bookingId || !tutorId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getEnhancedBookingDetail({ bookingId, tutorId });
      if (!data) {
        setError("Không tìm thấy booking hoặc bạn không có quyền xem.");
        setDetail(null);
        return;
      }
      setDetail(data);
    } finally {
      setLoading(false);
    }
  }, [bookingId, tutorId]);

  useEffect(() => {
    if (isLoading) return;
    void load();
  }, [isLoading, load]);

  const handleConfirm = async () => {
    if (!bookingId) return;
    setActionLoading(true);
    try {
      const result = await confirmBookingAndUnlock(bookingId);
      if (!result.ok) {
        setError(result.error ?? "Không thể xác nhận booking.");
      }
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!bookingId) return;
    setActionLoading(true);
    try {
      const result = await confirmCompletion(bookingId, "tutor");
      if (!result.ok) {
        setError(result.error ?? "Không thể xác nhận hoàn thành.");
      }
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveDraft = async (input: SavePlanInput) => {
    setActionLoading(true);
    try {
      await savePlanDraft(input);
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendPlan = async (input: SavePlanInput) => {
    setActionLoading(true);
    try {
      await sendPlan(input);
      await load();
    } finally {
      setActionLoading(false);
    }
  };

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

  if (!detail || !tutorId || error) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-3">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/tutor/bookings">
                <ArrowLeft className="h-4 w-4" />
                Quay lại bookings
              </Link>
            </Button>
            <Card>
              <CardContent className="p-6 text-sm text-destructive">
                {error ?? "Không có dữ liệu booking."}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    );
  }

  const { booking, enhancement } = detail;
  const flowStatus = enhancement.flowStatus;
  const isSensitiveVisible = isSensitiveInfoVisible(flowStatus);
  const latestOwnerChange = getLatestOwnerChange(detail);
  const canConfirm = flowStatus === "pending_confirmation";
  const canEditPlan = isSensitiveVisible;
  const canComplete = flowStatus === "in_session" || flowStatus === "awaiting_completion";
  const canReport = ["Confirmed", "InProgress", "Completed"].includes(booking.status as string)
    || flowStatus === "in_session" || flowStatus === "awaiting_completion";

  const chatHref = `/tutor/chats?convId=${buildConvId(booking.parentId, booking.tutorId)}&bookingId=${booking.id}`;

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container space-y-4">
          <header className="surface-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <Button asChild variant="ghost" size="sm" className="-ml-2 gap-2 px-2">
                  <Link href="/tutor/bookings">
                    <ArrowLeft className="h-4 w-4" />
                    Danh sách booking
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Chi tiết booking</h1>
                <BookingMetaRow bookingId={booking.id} startAt={booking.startAt} />
                {(booking.subjectName ?? booking.subject) ? (
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {booking.subjectName ?? booking.subject}
                    </span>
                    {booking.grade ? <span>{booking.grade}</span> : null}
                    <span>·</span>
                    <span>Trực tiếp</span>
                    {booking.studentName ? (
                      <span>· Học sinh: {booking.studentName}</span>
                    ) : null}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <BookingFlowBadge status={flowStatus} />
                {canReport && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                    onClick={() => setReportOpen(true)}
                  >
                    <Flag className="h-4 w-4" />
                    Báo cáo
                  </Button>
                )}
                <Button asChild variant="outline" className="gap-2">
                  <Link href={chatHref}>
                    <MessageSquare className="h-4 w-4" />
                    Mở chat
                  </Link>
                </Button>
                {canConfirm ? (
                  <Button className="gap-2" loading={actionLoading} onClick={handleConfirm}>
                    <ShieldCheck className="h-4 w-4" />
                    Xác nhận booking
                  </Button>
                ) : null}
                {canEditPlan ? (
                  <Button className="gap-2" onClick={() => setEditorOpen(true)}>
                    <PencilLine className="h-4 w-4" />
                    {enhancement.studyPlan ? "Sửa kế hoạch" : "Tạo kế hoạch"}
                  </Button>
                ) : null}
              </div>
            </div>
          </header>

          {canComplete && (
            <CompletionConfirmCard
              flowStatus={flowStatus}
              completionConfirmation={enhancement.completionConfirmation}
              role="tutor"
              onConfirm={handleComplete}
              loading={actionLoading}
            />
          )}

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <BookingStatusTimeline status={flowStatus} />
              {!isSensitiveVisible ? <PrivacyNotice isTutorView /> : null}
              <ParentPreferencesCard enhancement={enhancement} />
              <ContactMethodCard
                contactPreferences={enhancement.contactPreferences}
                isSensitiveVisible={isSensitiveVisible}
              />
              <LocationCard enhancement={enhancement} isSensitiveVisible={isSensitiveVisible} isTutorView />
              <StudyPlanCard enhancement={enhancement} />
            </div>

            <div className="space-y-4">
              <BookingGoalCard booking={booking} />

              <ContactOwnerCard enhancement={enhancement} latestOwnerChange={latestOwnerChange} />

              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Trạng thái booking</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    Người phụ trách liên lạc:
                    <span className="ml-1 font-medium">
                      {enhancement.currentContactOwner.name} ({formatContactOwnerRole(enhancement.currentContactOwner.role)})
                    </span>
                  </p>
                  <p>
                    Thông tin liên lạc:
                    <span className="ml-1 font-medium">{isSensitiveVisible ? "Đã mở khóa" : "Đang ẩn"}</span>
                  </p>
                  {!isSensitiveVisible ? (
                    <p className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-900">
                      Xác nhận booking để xem đầy đủ thông tin liên lạc của phụ huynh.
                    </p>
                  ) : null}
                </CardContent>
              </Card>

              <BookingReportsList bookingId={booking.id} refreshKey={reportRefreshKey} />
            </div>
          </div>
        </div>
      </section>

      <StudyPlanEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        enhancement={enhancement}
        onSaveDraft={handleSaveDraft}
        onSendPlan={handleSendPlan}
      />

      <ReportDisputeModal
        bookingId={booking.id}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSuccess={() => { void load(); setReportRefreshKey((k) => k + 1); }}
      />
    </main>
  );
}

