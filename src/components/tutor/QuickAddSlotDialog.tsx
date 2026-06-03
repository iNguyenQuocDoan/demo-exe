/**
 * Quick "create teaching slot" dialog (BE-backed).
 * Tutor picks weekdays + a time window + how many weeks to repeat. For each
 * weekday we create a recurring slot series on the real backend
 * (POST /api/bookings/slots), so parents can actually book it.
 */
"use client";

import { useMemo, useState } from "react";
import { CalendarPlus, Clock, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 7, label: "CN" },
];

export interface QuickSlotInput {
  days: number[]; // 1=Mon … 7=Sun
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  numberOfWeeks: number;
}

interface QuickAddSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Create recurring slots on the backend. Should resolve after reload. */
  onCreate: (input: QuickSlotInput) => Promise<void>;
}

export function QuickAddSlotDialog({
  open,
  onOpenChange,
  onCreate,
}: QuickAddSlotDialogProps) {
  const [days, setDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");
  const [numberOfWeeks, setNumberOfWeeks] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (value: number) =>
    setDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value],
    );

  const error = useMemo(() => {
    if (days.length === 0) return "Chọn ít nhất một ngày trong tuần";
    if (endTime <= startTime) return "Giờ kết thúc phải sau giờ bắt đầu";
    if (numberOfWeeks < 1 || numberOfWeeks > 12) return "Số tuần lặp lại từ 1 đến 12";
    return null;
  }, [days, startTime, endTime, numberOfWeeks]);

  const totalSlots = days.length * numberOfWeeks;

  const handleSubmit = async () => {
    if (error) return;
    setSubmitting(true);
    try {
      await onCreate({
        days: days.slice().sort((a, b) => a - b),
        startTime,
        endTime,
        numberOfWeeks,
      });
      setDays([]);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <CalendarPlus className="h-4.5 w-4.5 text-primary" />
            </span>
            Tạo ca dạy nhanh
          </DialogTitle>
          <DialogDescription>
            Chọn các ngày, khung giờ và số tuần lặp lại — ca sẽ được mở để phụ huynh đặt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* Weekday multi-select */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Ngày trong tuần</label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const active = days.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      "h-10 w-12 rounded-lg border text-sm font-semibold transition-colors",
                      active
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-background text-foreground hover:border-primary/50",
                    )}
                  >
                    {day.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time window */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Bắt đầu</label>
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-11 text-base font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Kết thúc</label>
              <Input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-11 text-base font-semibold"
              />
            </div>
          </div>

          {/* Repeat weeks */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              Lặp lại trong
              <span className="text-xs font-normal text-muted-foreground">(số tuần)</span>
            </label>
            <Input
              type="number"
              value={numberOfWeeks}
              onChange={(e) => setNumberOfWeeks(Number(e.target.value))}
              min={1}
              max={12}
              className="h-11 text-base"
            />
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Mỗi ngày tạo {numberOfWeeks} buổi (mỗi tuần 1 buổi từ tuần này).
            </p>
          </div>

          {error && days.length > 0 && (
            <p className="text-xs font-medium text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} loading={submitting} disabled={!!error} className="gap-2">
            <CalendarPlus className="h-4 w-4" />
            Tạo {totalSlots > 0 ? `${totalSlots} buổi` : "ca"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
