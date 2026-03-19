/**
 * Tutor Availability Manager Component
 * Manage weekly slots, exceptions, and booking settings
 */
"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getTutorAvailability,
  saveAvailability,
  addWeeklySlot,
  updateWeeklySlot,
  deleteWeeklySlot,
  toggleAcceptingBookings,
} from "@/api/availabilityApi";
import { getBookings } from "@/api/bookingApi";
import type { TutorAvailability, WeeklySlot, Booking } from "@/types";

/** Returns count of upcoming confirmed/in-progress bookings that fall within a weekly slot */
function countBookingsOnSlot(bookings: Booking[], slot: WeeklySlot): number {
  const now = new Date();
  return bookings.filter((b) => {
    if (!["Confirmed", "InProgress"].includes(b.status)) return false;
    const start = new Date(b.startAt);
    if (start < now) return false;
    const jsDay = start.getDay(); // 0=Sun
    const slotDay = slot.dayOfWeek === 7 ? 0 : slot.dayOfWeek; // 1-7 → 1-6,0
    if (jsDay !== slotDay) return false;
    const bTime = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
    return bTime >= slot.startTime && bTime < slot.endTime;
  }).length;
}
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Clock,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Save,
  Calendar,
  Info,
} from "lucide-react";

const WEEKDAYS = [
  { value: 1, label: "Thứ 2" },
  { value: 2, label: "Thứ 3" },
  { value: 3, label: "Thứ 4" },
  { value: 4, label: "Thứ 5" },
  { value: 5, label: "Thứ 6" },
  { value: 6, label: "Thứ 7" },
  { value: 7, label: "Chủ nhật" },
];

export function AvailabilityManager() {
  const { user } = useAuthStore();
  const tutorId = user?.tutorProfileId ?? "";

  const [availability, setAvailability] = useState<TutorAvailability | null>(null);
  const [confirmedBookings, setConfirmedBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [defaultDuration, setDefaultDuration] = useState(90);
  const [maxBookingsPerDay, setMaxBookingsPerDay] = useState(3);
  const [acceptingBookings, setAcceptingBookings] = useState(true);

  const loadAvailability = async () => {
    if (!tutorId) return;
    setLoading(true);
    const [data, bookings] = await Promise.all([
      getTutorAvailability(tutorId),
      getBookings({ tutorId }).catch(() => [] as Booking[]),
    ]);
    setConfirmedBookings(bookings);
    if (data) {
      setAvailability(data);
      setDefaultDuration(data.defaultSessionDuration);
      setMaxBookingsPerDay(data.maxBookingsPerDay);
      setAcceptingBookings(data.acceptingBookings);
    } else {
      setAvailability({
        id: "",
        tutorId,
        weeklySlots: [],
        exceptions: [],
        defaultSessionDuration: 90,
        maxBookingsPerDay: 3,
        acceptingBookings: true,
        updatedAt: new Date().toISOString(),
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tutorId]);

  const handleSaveSettings = async () => {
    if (!availability) return;

    setSaving(true);
    await saveAvailability({
      tutorId,
      weeklySlots: availability.weeklySlots,
      exceptions: availability.exceptions,
      defaultSessionDuration: defaultDuration,
      maxBookingsPerDay,
      acceptingBookings,
    });
    setSaving(false);
    await loadAvailability();
  };

  const handleAddSlot = async (dayOfWeek: number) => {
    const newSlot = {
      dayOfWeek,
      startTime: "18:00",
      endTime: "21:00",
      duration: defaultDuration,
      isActive: true,
      isLocked: false,
    };

    const result = await addWeeklySlot(tutorId, newSlot);
    if (result.ok) {
      await loadAvailability();
    }
  };

  const handleUpdateSlot = async (
    slotId: string,
    updates: Partial<WeeklySlot>,
  ) => {
    const result = await updateWeeklySlot(tutorId, slotId, updates);
    if (result.ok) {
      await loadAvailability();
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Bạn có chắc muốn xóa khung giờ này?")) return;

    const result = await deleteWeeklySlot(tutorId, slotId);
    if (result.ok) {
      await loadAvailability();
    }
  };

  const handleToggleAccepting = async (value: boolean) => {
    setAcceptingBookings(value);
    await toggleAcceptingBookings(tutorId, value);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-7 w-52 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const hasAnySlots =
    availability?.weeklySlots && availability.weeklySlots.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Calendar className="h-4.5 w-4.5 text-primary" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Quản lý lịch trống</h1>
      </div>

      {/* Global Settings */}
      <div className="surface-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Cài đặt chung</h2>
            <p className="text-sm text-muted-foreground">
              Tùy chỉnh thời lượng và số buổi học
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground flex items-center gap-1">
              Thời lượng mỗi buổi
              <span className="text-xs text-muted-foreground font-normal">
                (phút)
              </span>
            </label>
            <Input
              type="number"
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(Number(e.target.value))}
              min={30}
              step={15}
              className="h-11 text-base"
            />
            <p className="text-xs text-muted-foreground">
              Khuyến nghị: 60-90 phút
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Số buổi tối đa mỗi ngày
            </label>
            <Input
              type="number"
              value={maxBookingsPerDay}
              onChange={(e) => setMaxBookingsPerDay(Number(e.target.value))}
              min={1}
              max={10}
              className="h-11 text-base"
            />
            <p className="text-xs text-muted-foreground">
              Giới hạn booking/ngày
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">
              Trạng thái nhận lịch
            </label>
            <div className="flex items-center gap-3 h-11 px-4 rounded-lg border border-border bg-background">
              <Switch
                checked={acceptingBookings}
                onCheckedChange={handleToggleAccepting}
              />
              <span
                className={
                  acceptingBookings
                    ? "text-success font-semibold"
                    : "text-muted-foreground"
                }
              >
                {acceptingBookings ? "Đang mở" : "Đã tắt"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {acceptingBookings
                ? "Phụ huynh có thể đặt lịch"
                : "Tạm ngưng nhận booking"}
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <Button
            onClick={handleSaveSettings}
            loading={saving}
            size="lg"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Lưu cài đặt
          </Button>
        </div>
      </div>

      {/* Weekly Slots */}
      <div className="surface-card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Lịch theo tuần
              </h2>
              <p className="text-sm text-muted-foreground">
                {hasAnySlots
                  ? `${availability.weeklySlots.length} khung giờ`
                  : "Chưa có khung giờ nào"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {WEEKDAYS.map((day) => {
            const daySlots =
              availability?.weeklySlots.filter(
                (s) => s.dayOfWeek === day.value,
              ) || [];

            return (
              <div
                key={day.value}
                className="border border-border rounded-lg p-5 bg-background/50"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{day.label}</h3>
                    <Badge variant="outline" className="text-xs">
                      {daySlots.length} khung giờ
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddSlot(day.value)}
                    className="gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    Thêm khung giờ
                  </Button>
                </div>

                {daySlots.length === 0 ? (
                  <div className="py-8 text-center border-2 border-dashed border-border rounded-lg">
                    <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Chưa có khung giờ nào cho {day.label}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {daySlots.map((slot) => {
                      const bookedCount = countBookingsOnSlot(confirmedBookings, slot);
                      return (
                      <div
                        key={slot.id}
                        className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={slot.isActive}
                            onCheckedChange={(checked) =>
                              handleUpdateSlot(slot.id, { isActive: checked })
                            }
                          />
                          <Badge
                            variant={slot.isActive ? "success" : "secondary"}
                            className="text-xs"
                          >
                            {slot.isActive ? "Bật" : "Tắt"}
                          </Badge>
                          {bookedCount > 0 && (
                            <Badge variant="warning" className="text-xs gap-1">
                              Đã đặt {bookedCount}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                          <Clock className="h-4 w-4 text-primary" />
                          <Input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) =>
                              handleUpdateSlot(slot.id, {
                                startTime: e.target.value,
                              })
                            }
                            className="w-32 h-10 text-base font-semibold"
                            disabled={slot.isLocked}
                          />
                          <span className="text-muted-foreground font-medium">
                            đến
                          </span>
                          <Input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) =>
                              handleUpdateSlot(slot.id, {
                                endTime: e.target.value,
                              })
                            }
                            className="w-32 h-10 text-base font-semibold"
                            disabled={slot.isLocked}
                          />
                        </div>

                        <div className="text-sm font-semibold text-muted-foreground bg-muted px-3 py-2 rounded-md">
                          {slot.duration} phút
                        </div>

                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleUpdateSlot(slot.id, {
                                isLocked: !slot.isLocked,
                              })
                            }
                            title={slot.isLocked ? "Mở khóa" : "Khóa"}
                            className="h-9 w-9 p-0"
                          >
                            {slot.isLocked ? (
                              <Lock className="h-4 w-4 text-warning" />
                            ) : (
                              <Unlock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={slot.isLocked}
                            className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Notice */}
      <div className="surface-card bg-primary/5 border-primary/20 p-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Hướng dẫn sử dụng</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
              <li>
                Lịch trống sẽ hiển thị cho phụ huynh sau khi bật &ldquo;Đang
                nhận lịch&rdquo;
              </li>
              <li>Khung giờ đã khóa không thể chỉnh sửa nếu đã có booking</li>
              <li>Bạn có thể tạo nhiều khung giờ trong cùng một ngày</li>
              <li>Tắt khung giờ để tạm ẩn mà không cần xóa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
