/**
 * Tutor Availability Manager — BE-backed.
 * Reads the tutor's real slots (GET /api/tutors/slots/{tutorId}) and creates
 * new recurring slots on the backend (POST /api/bookings/slots) via the quick-add
 * dialog. The backend slot model is concrete dated slots with a booking status,
 * so this view lists upcoming slots grouped by date — there is no mock weekly grid.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { getTutorAllSlots } from "@/api/tutorApi";
import { createTutorSlots } from "@/api/bookingApi";
import {
  QuickAddSlotDialog,
  type QuickSlotInput,
} from "@/components/tutor/QuickAddSlotDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarPlus, Clock, Info } from "lucide-react";

interface TutorSlot {
  id: string;
  startTime: string; // ISO datetime
  endTime: string;
  status: string;
  hourlyRate: number;
}

const VI_DOW = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const hm = (iso: string) => {
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Next calendar date (today or later) whose weekday matches dow (1=Mon … 7=Sun). */
function nextDateForWeekday(dow: number): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const jsTarget = dow === 7 ? 0 : dow; // 7 (Sun) → JS 0
  const diff = (jsTarget - today.getDay() + 7) % 7;
  const d = new Date(today);
  d.setDate(today.getDate() + diff);
  return ymd(d);
}

function statusBadge(status: string): { label: string; variant: "success" | "warning" | "secondary" } {
  switch ((status ?? "").toUpperCase()) {
    case "AVAILABLE":
    case "ACTIVE":
      return { label: "Còn trống", variant: "success" };
    case "BOOKED":
      return { label: "Đã đặt", variant: "warning" };
    default:
      return { label: status || "—", variant: "secondary" };
  }
}

export function AvailabilityManager() {
  const { user } = useAuthStore();
  const tutorId = user?.tutorProfileId ?? "";

  const [groups, setGroups] = useState<[string, TutorSlot[]][]>([]);
  const [loading, setLoading] = useState(true);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!tutorId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getTutorAllSlots(tutorId);
    // Keep upcoming slots (not yet finished), sort by start, group by date.
    const now = Date.now();
    const upcoming = [...data]
      .filter((s) => new Date(s.endTime).getTime() >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    const map = new Map<string, TutorSlot[]>();
    for (const s of upcoming) {
      const key = ymd(new Date(s.startTime));
      const arr = map.get(key);
      if (arr) arr.push(s);
      else map.set(key, [s]);
    }
    setGroups(Array.from(map.entries()));
    setLoading(false);
  }, [tutorId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleQuickAdd = async (input: QuickSlotInput) => {
    setError(null);
    const results = await Promise.all(
      input.days.map((dow) =>
        createTutorSlots({
          startTime: input.startTime,
          endTime: input.endTime,
          startDate: nextDateForWeekday(dow),
          numberOfWeeks: input.numberOfWeeks,
        }),
      ),
    );
    const failed = results.find((r) => !r.ok);
    if (failed) setError(failed.error ?? "Không thể tạo ca");
    await load();
  };

  const totalUpcoming = groups.reduce((s, [, arr]) => s + arr.length, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Calendar className="h-4.5 w-4.5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Lịch trống</h1>
        </div>
        <Button onClick={() => setQuickAddOpen(true)} className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          Tạo ca nhanh
        </Button>
      </div>

      <QuickAddSlotDialog
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onCreate={handleQuickAdd}
      />

      {error && (
        <div className="surface-card border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Slots list */}
      <div className="surface-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Ca sắp tới</h2>
              <p className="text-sm text-muted-foreground">
                {loading
                  ? "Đang tải…"
                  : totalUpcoming > 0
                    ? `${totalUpcoming} ca trong ${groups.length} ngày`
                    : "Chưa có ca nào"}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border py-12 text-center">
            <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground">Chưa có ca dạy nào</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Bấm &ldquo;Tạo ca nhanh&rdquo; để mở lịch trống cho phụ huynh đặt.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map(([date, daySlots]) => {
              const d = new Date(date + "T00:00:00");
              return (
                <div key={date} className="rounded-lg border border-border bg-background/50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{VI_DOW[d.getDay()]}</h3>
                    <span className="text-sm text-muted-foreground">
                      {d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {daySlots.length} ca
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {daySlots.map((slot) => {
                      const badge = statusBadge(slot.status);
                      return (
                        <div
                          key={slot.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
                        >
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="text-base font-semibold text-foreground">
                            {hm(slot.startTime)} – {hm(slot.endTime)}
                          </span>
                          <Badge variant={badge.variant} className="text-xs">
                            {badge.label}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Notice */}
      <div className="surface-card border-primary/20 bg-primary/5 p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Hướng dẫn sử dụng</h3>
            <ul className="list-inside list-disc space-y-1.5 text-sm text-muted-foreground">
              <li>Ca dạy bạn tạo sẽ hiển thị ngay cho phụ huynh để đặt lịch.</li>
              <li>Mỗi ngày được chọn sẽ tạo 1 ca/tuần, lặp lại theo số tuần đã nhập.</li>
              <li>Ca &ldquo;Đã đặt&rdquo; là buổi học phụ huynh đã đặt qua ca trống của bạn.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
