"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Search,
  Star,
  XCircle,
  Banknote,
  MessageSquare,
} from "lucide-react";
import { ReviewModal } from "@/components/booking/ReviewModal";
import { ReportDisputeModal } from "@/components/booking/ReportDisputeModal";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getBookings, cancelBooking, completeBooking } from "@/api/bookingApi";
import { getTutorNameMap } from "@/api/referenceApi";
import { getOrCreateConversation } from "@/api/chatApi";
import { getBookingHoldsForUser } from "@/api/walletApi";
import type { BookingHold } from "@/types";
import { PageAnimations } from "@/components/animations/PageAnimations";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { bookingStatusMeta } from "@/lib/statusMeta";
import { useAuthStore } from "@/store/useAuthStore";
import type { Booking, BookingStatus } from "@/types";

// Gom nhóm trạng thái để booking ở các trạng thái trung gian (InProgress,
// TutorCompleted, ParentCompleted…) vẫn xuất hiện trong tab tương ứng.
const STATUS_GROUPS: Record<string, BookingStatus[]> = {
  Pending: ["Pending", "AwaitingPayment"],
  Active: ["Confirmed", "InProgress", "TutorCompleted", "ParentCompleted"],
  Completed: ["Completed"],
  Cancelled: ["Cancelled", "Disputed", "Resolved"],
};

const STATUS_OPTIONS: Array<{ key: "all" | keyof typeof STATUS_GROUPS; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "Pending", label: "Chờ xác nhận" },
  { key: "Active", label: "Đang diễn ra" },
  { key: "Completed", label: "Hoàn thành" },
  { key: "Cancelled", label: "Đã huỷ" },
];

export default function ParentBookingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tutorNameMap, setTutorNameMap] = useState<Record<string, string>>({});
  const [holdMap, setHoldMap] = useState<Record<string, BookingHold>>({});
  const [activeStatus, setActiveStatus] =
    useState<(typeof STATUS_OPTIONS)[number]["key"]>("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [search, setSearch] = useState("");
  const [reviewTarget, setReviewTarget] = useState<Booking | null>(null);
  const [disputeTarget, setDisputeTarget] = useState<Booking | null>(null);

  const parentId = user?.id ?? null;

  const loadData = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const [data, holds] = await Promise.all([
        getBookings({ parentId: id }),
        getBookingHoldsForUser(),
      ]);
      setBookings(
        data.sort(
          (a, b) =>
            new Date(b.startAt).getTime() - new Date(a.startAt).getTime(),
        ),
      );
      setHoldMap(Object.fromEntries(holds.map((h) => [h.bookingId, h])));
      const tutorIds = Array.from(new Set(data.map((item) => item.tutorId)));
      if (tutorIds.length > 0) {
        const names = await getTutorNameMap(tutorIds);
        setTutorNameMap(names);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isLoading || !user) return;
    void loadData(user.id);
  }, [isLoading, loadData, user]);

  const filtered = useMemo(() => {
    let result =
      activeStatus === "all"
        ? bookings
        : bookings.filter((item) => STATUS_GROUPS[activeStatus]?.includes(item.status));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((item) =>
        (item.tutorName || tutorNameMap[item.tutorId] || item.tutorId)
          .toLowerCase()
          .includes(q)
      );
    }
    return result;
  }, [activeStatus, bookings, search, tutorNameMap]);

  const handleCancelConfirm = async () => {
    if (!parentId || !confirmCancelId) return;
    setActionLoading(confirmCancelId);
    try {
      await cancelBooking(
        confirmCancelId,
        parentId,
        cancelReason.trim() || "Phụ huynh huỷ lịch",
      );
      await loadData(parentId);
      setConfirmCancelId(null);
      setCancelReason("");
    } finally {
      setActionLoading(null);
    }
  };

  const handleChat = async (booking: Booking) => {
    if (!user) return;
    const tutorName = tutorNameMap[booking.tutorId] ?? booking.tutorId;
    const conv = await getOrCreateConversation(user.id, booking.tutorId, user.fullName, tutorName);
    router.push(`/parent/chats?convId=${conv.id}&bookingId=${booking.id}`);
  };

  const handleConfirmComplete = async (id: string) => {
    if (!parentId) return;
    setActionLoading(id);
    try {
      const res = await completeBooking(id);
      if (!res.ok) { alert(res.error ?? "Không thể xác nhận hoàn thành."); return; }
      await loadData(parentId);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading || loading) {
    return (
      <main className="min-h-dvh bg-(--bg-app)">
        <section className="pt-4 pb-8">
          <div className="site-container space-y-3">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </section>
      </main>
    );
  }


  return (
    <main className="min-h-dvh bg-(--bg-app)">
      <PageAnimations />
      <section className="pt-4 pb-8">
        <div className="site-container space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Lịch học của tôi</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {loading ? "Đang tải..." : `${filtered.length} kết quả`}
              </span>
              <Button asChild size="sm" className="gap-1.5">
                <Link href="/tutors">
                  <Search className="h-3.5 w-3.5" />
                  Tìm gia sư
                </Link>
              </Button>
            </div>
          </div>

          <div className="surface-card p-3 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên gia sư..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Tabs
              value={activeStatus}
              onValueChange={(value) =>
                setActiveStatus(value as typeof activeStatus)
              }
            >
              <TabsList className="w-full flex-wrap h-auto">
                {STATUS_OPTIONS.map((status) => (
                  <TabsTrigger
                    key={status.key}
                    value={status.key}
                    className="text-xs sm:text-sm"
                  >
                    {status.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <section className="surface-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Danh sách booking</h2>
              </div>
              <span className="text-xs text-muted-foreground">{filtered.length} kết quả</span>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                icon={Clock3}
                title="Không có booking nào"
                description={`Bạn chưa có booking ${activeStatus !== "all" ? "với trạng thái này" : "nào"}. Hãy tìm gia sư và đặt buổi học đầu tiên!`}
                action={{
                  label: "Tìm gia sư",
                  onClick: () => router.push("/tutors"),
                }}
              />
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((booking) => {
                  const canCancel =
                    booking.status === "Pending" ||
                    booking.status === "Confirmed";
                  const hold = holdMap[booking.id];
                  const holdLabel =
                    hold?.status === "Held"
                      ? {
                          text: "Đang giữ tiền",
                          cls: "text-amber-700 bg-amber-50 border-amber-200",
                        }
                      : hold?.status === "Charged"
                        ? {
                            text: "Đã thu tiền",
                            cls: "text-success bg-success/10 border-success/30",
                          }
                        : hold?.status === "Released"
                          ? {
                              text: "Đã hoàn tiền",
                              cls: "text-muted-foreground bg-muted/40 border-border",
                            }
                          : hold?.status === "Refunded"
                            ? {
                                text: "Đã hoàn tiền",
                                cls: "text-muted-foreground bg-muted/40 border-border",
                              }
                            : null;

                  return (
                    <article
                      key={booking.id}
                      className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-foreground">
                            {booking.tutorName || tutorNameMap[booking.tutorId] || booking.tutorId || "Gia sư"}
                          </span>
                          <StatusBadge meta={bookingStatusMeta(booking.status, "parent")} />
                          <Badge variant="outline">{booking.type}</Badge>
                          {holdLabel && (
                            <span
                              className={`inline-flex items-center gap-1 text-xs border rounded-full px-2 py-0.5 ${holdLabel.cls}`}
                            >
                              <Banknote className="h-3 w-3" />
                              {holdLabel.text}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.startAt).toLocaleString("vi-VN")} -{" "}
                          {formatCurrency(booking.totalAmount)}
                        </p>
                        {booking.status === "Cancelled" && booking.reason && (
                          <p className="text-xs text-destructive/80 mt-0.5 flex items-start gap-1">
                            <XCircle className="h-3 w-3 mt-0.5 shrink-0" />
                            <span>Lý do hủy: {booking.reason}</span>
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/parent/bookings/${booking.id}`}>Chi tiết</Link>
                        </Button>
                        {(booking.status === "Confirmed" || booking.status === "InProgress") && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                            onClick={() => void handleChat(booking)}
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            Nhắn tin
                          </Button>
                        )}
                        {booking.status === "TutorCompleted" && (
                          <Button
                            size="sm"
                            className="gap-1.5"
                            loading={actionLoading === booking.id}
                            onClick={() => void handleConfirmComplete(booking.id)}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Xác nhận hoàn thành
                          </Button>
                        )}
                        {booking.status === "Completed" && (
                          <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setReviewTarget(booking)}
                          >
                            <Star className="h-3.5 w-3.5" />
                            Đánh giá
                          </Button>
                        )}
                        {["Confirmed", "InProgress", "TutorCompleted", "ParentCompleted", "Completed"].includes(booking.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-destructive/30 text-destructive hover:bg-destructive/5"
                            onClick={() => setDisputeTarget(booking)}
                          >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Khiếu nại
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              setConfirmCancelId(booking.id);
                              setCancelReason("");
                            }}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Huỷ booking
                          </Button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>

      <ReviewModal
        open={!!reviewTarget}
        bookingId={reviewTarget?.id ?? ""}
        tutorId={reviewTarget?.tutorId ?? ""}
        tutorName={reviewTarget ? tutorNameMap[reviewTarget.tutorId] : undefined}
        onClose={() => setReviewTarget(null)}
      />

      <ReportDisputeModal
        bookingId={disputeTarget?.id ?? ""}
        open={!!disputeTarget}
        onClose={() => setDisputeTarget(null)}
        onSuccess={() => {
          toast.success("Đã gửi khiếu nại. Vui lòng chờ phản hồi.");
          if (parentId) void loadData(parentId);
          router.push("/my-disputes");
        }}
      />

      {/* Cancel confirmation dialog */}
      <Dialog
        open={!!confirmCancelId}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmCancelId(null);
            setCancelReason("");
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận huỷ booking
            </DialogTitle>
            <DialogDescription>
              Hành động này không thể hoàn tác. Tiền đang giữ sẽ được hoàn lại
              vào ví của bạn.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5 py-1">
            <label className="text-xs font-medium text-muted-foreground">
              Lý do huỷ (tùy chọn)
            </label>
            <textarea
              className="w-full resize-none rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Ví dụ: Thay đổi lịch cá nhân..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setConfirmCancelId(null);
                setCancelReason("");
              }}
            >
              Không, giữ lại
            </Button>
            <Button
              variant="destructive"
              loading={!!actionLoading}
              onClick={handleCancelConfirm}
            >
              Huỷ booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
