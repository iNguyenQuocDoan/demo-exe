"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, Flag, MessageSquare, Monitor } from "lucide-react";
import { getTutorNameMap } from "@/api/referenceApi";
import { confirmCompletion, getEnhancedBookingDetail, getLatestOwnerChange } from "@/api/bookingEnhancedApi";
import {
  isSensitiveInfoVisible,
  formatContactOwnerRole,
} from "@/lib/bookingEnhancedMock";
import { buildConvId } from "@/api/chatApi";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookingFlowBadge,
  BookingStatusTimeline,
  CompletionConfirmCard,
  ContactMethodCard,
  ContactOwnerCard,
  LocationCard,
  PrivacyNotice,
  StudyPlanCard,
} from "@/components/booking/EnhancedBookingBlocks";
import { BookingGoalCard } from "@/components/booking/BookingGoalCard";
import { ReportDisputeModal } from "@/components/booking/ReportDisputeModal";
import { BookingReportsList } from "@/components/booking/BookingReportsList";
import { ReviewCardLoader } from "@/components/booking/ReviewCard";


export default function ParentBookingDetailPage() {
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
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof getEnhancedBookingDetail>>>(null);
  const [tutorName, setTutorName] = useState<string>("");

  const load = useCallback(async () => {
    if (!user || !bookingId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getEnhancedBookingDetail({
        bookingId,
        parentId: user.id,
      });

      if (!data) {
        setError("Không tìm thấy booking hoặc bạn không có quyền xem.");
        setDetail(null);
        return;
      }

      setDetail(data);
      const map = await getTutorNameMap([data.booking.tutorId]);
      setTutorName(map[data.booking.tutorId] ?? data.booking.tutorId);
    } finally {
      setLoading(false);
    }
  }, [bookingId, user]);

  useEffect(() => {
    if (isLoading) return;
    void load();
  }, [isLoading, load]);

  const handleComplete = async () => {
    if (!bookingId) return;
    setActionLoading(true);
    try {
      const result = await confirmCompletion(bookingId, "parent");
      if (!result.ok) {
        setError(result.error ?? "Không thể xác nhận hoàn thành.");
      }
      await load();
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-3">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }

  if (!detail || error) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-3">
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href="/parent/bookings">
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Link>
            </Button>
            <div className="surface-card p-5 text-sm text-destructive">
              {error ?? "Không có dữ liệu booking."}
            </div>
          </div>
        </section>
      </main>
    );
  }

  const { booking, enhancement } = detail;
  const flowStatus = enhancement.flowStatus;
  const isSensitiveVisible = isSensitiveInfoVisible(flowStatus);
  const latestOwnerChange = getLatestOwnerChange(detail);
  const teachingMode = "Trực tiếp";
  const canComplete = flowStatus === "in_session" || flowStatus === "awaiting_completion";
  const canReport = ["Confirmed", "InProgress", "Completed"].includes(booking.status as string)
    || flowStatus === "in_session" || flowStatus === "awaiting_completion";

  const chatHref = `/parent/chats?convId=${buildConvId(booking.parentId, booking.tutorId)}&bookingId=${booking.id}`;

  const startDate = new Date(booking.startAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const startTime = new Date(booking.startAt).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <section className="pt-4 pb-8">
        <div className="site-container space-y-3">

          {/* Back link */}
          <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1.5 px-2 text-muted-foreground hover:text-foreground">
            <Link href="/parent/bookings">
              <ArrowLeft className="h-4 w-4" />
              Lịch học của tôi
            </Link>
          </Button>

          {/* Summary strip */}
          <div className="surface-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <h1 className="text-lg font-semibold text-foreground">
                  Chi tiết booking · <span className="text-muted-foreground font-normal text-base">Gia sư {tutorName}</span>
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <BookingFlowBadge status={flowStatus} />
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    <Monitor className="h-3 w-3" />
                    {teachingMode}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {startDate} · {startTime}
                  </span>
                  <span className="text-xs text-muted-foreground">#{booking.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
                <Button asChild size="sm" className="gap-2">
                  <Link href={chatHref}>
                    <MessageSquare className="h-4 w-4" />
                    Mở chat
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Completion confirmation */}
          {canComplete && (
            <CompletionConfirmCard
              flowStatus={flowStatus}
              completionConfirmation={enhancement.completionConfirmation}
              role="parent"
              onConfirm={handleComplete}
              loading={actionLoading}
            />
          )}

          {/* Main content grid */}
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              <BookingStatusTimeline status={flowStatus} />
              {!isSensitiveVisible ? <PrivacyNotice /> : null}
              <ContactMethodCard
                contactPreferences={enhancement.contactPreferences}
                isSensitiveVisible={isSensitiveVisible}
              />
              <LocationCard enhancement={enhancement} isSensitiveVisible={isSensitiveVisible} />
              <StudyPlanCard enhancement={enhancement} />
            </div>

            <div className="space-y-3">
              <BookingGoalCard booking={booking} />
              <ContactOwnerCard enhancement={enhancement} latestOwnerChange={latestOwnerChange} />
              <BookingReportsList bookingId={booking.id} refreshKey={reportRefreshKey} />
              {booking.status === "Completed" && (
                <ReviewCardLoader
                  bookingId={booking.id}
                  tutorId={booking.tutorId}
                  tutorName={tutorName}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <ReportDisputeModal
        bookingId={booking.id}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        onSuccess={() => { void load(); setReportRefreshKey((k) => k + 1); }}
      />
    </main>
  );
}
