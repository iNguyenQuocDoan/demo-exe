"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar, Flag, MessageSquare, Monitor } from "lucide-react";
import { getTutorNameMap } from "@/api/referenceApi";
import { completeBooking, getBookingById } from "@/api/bookingApi";
import { buildConvId } from "@/api/chatApi";
import { bookingStatusMeta } from "@/lib/bookingStatus";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingGoalCard } from "@/components/booking/BookingGoalCard";
import { ReportDisputeModal } from "@/components/booking/ReportDisputeModal";
import { BookingReportsList } from "@/components/booking/BookingReportsList";
import { ReviewCardLoader } from "@/components/booking/ReviewCard";
import type { Booking } from "@/types";

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
  const [booking, setBooking] = useState<Booking | null>(null);
  const [tutorName, setTutorName] = useState<string>("");

  const load = useCallback(async () => {
    if (!user || !bookingId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getBookingById({ bookingId, parentId: user.id });
      if (!data) {
        setError("Không tìm thấy booking hoặc bạn không có quyền xem.");
        setBooking(null);
        return;
      }
      setBooking(data);
      // BE history chỉ trả tutorName (không có tutorId) → ưu tiên dùng tên đó.
      if (data.tutorName) {
        setTutorName(data.tutorName);
      } else {
        const map = await getTutorNameMap([data.tutorId]);
        setTutorName(map[data.tutorId] ?? data.tutorId);
      }
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
      const result = await completeBooking(bookingId);
      if (!result.ok) setError(result.error ?? "Không thể xác nhận hoàn thành.");
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

  if (!booking || error) {
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

  const statusMeta = bookingStatusMeta(booking.status, "parent");
  const teachingMode = "Trực tiếp";
  // Phụ huynh xác nhận hoàn thành khi đang học, hoặc khi gia sư đã báo xong trước.
  const canComplete = booking.status === "InProgress" || booking.status === "TutorCompleted";
  const canReport = ["Confirmed", "InProgress", "TutorCompleted", "ParentCompleted", "Completed"].includes(booking.status);

  const chatHref = `/parent/chats?convId=${buildConvId(booking.parentId, booking.tutorId)}&bookingId=${booking.id}`;

  const startAt = booking.startAt ? new Date(booking.startAt) : null;
  const startDate = startAt
    ? startAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";
  const startTime = startAt
    ? startAt.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    : "";

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
                  <StatusBadge meta={statusMeta} className="text-xs" />
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
                {canComplete ? (
                  <Button
                    size="sm"
                    className="gap-2"
                    loading={actionLoading}
                    onClick={handleComplete}
                  >
                    <Flag className="h-4 w-4" />
                    Xác nhận hoàn thành
                  </Button>
                ) : null}
                <Button asChild size="sm" className="gap-2">
                  <Link href={chatHref}>
                    <MessageSquare className="h-4 w-4" />
                    Mở chat
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Main content grid */}
          <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              <BookingGoalCard booking={booking} />
            </div>

            <div className="space-y-3">
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
