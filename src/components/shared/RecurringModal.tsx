"use client";

import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, Calendar, CheckCircle2, Repeat2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSeries, previewSeries } from "@/api/bookingApi";
import { getFeeConfig } from "@/api/referenceApi";
import { computeFeeBreakdown } from "@/lib/business/rules";
import { useAuthStore } from "@/store/useAuthStore";
import { formatCurrency, parseBeDate } from "@/lib/utils";
import type { FeeConfig, TutorProfile } from "@/types";
import { format } from "date-fns";

const DOW_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const DOW_VALUES = [2, 3, 4, 5, 6, 7, 1];
const DURATION_OPTIONS = [60, 90, 120];

interface Props {
  tutor: TutorProfile;
  onClose: () => void;
}

type Step = "form" | "preview" | "success" | "error";

export function RecurringModal({ tutor, onClose }: Props) {
  const { user } = useAuthStore();

  const [step, setStep] = useState<Step>("form");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("18:00");
  const [durationMins, setDurationMins] = useState(90);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  });
  const [occurrenceCount, setOccurrenceCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [previewSessions, setPreviewSessions] = useState<Array<{ startAt: string; endAt: string }>>([]);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [seriesId, setSeriesId] = useState("");
  const [feeConfig, setFeeConfig] = useState<FeeConfig | null>(null);

  useEffect(() => {
    let active = true;
    void getFeeConfig().then((config) => {
      if (!active) return;
      setFeeConfig(config);
    });
    return () => {
      active = false;
    };
  }, []);

  const toggleDay = (dayOfWeek: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(dayOfWeek)
        ? prev.filter((item) => item !== dayOfWeek)
        : [...prev, dayOfWeek].sort()
    );
  };

  const fee = feeConfig
    ? computeFeeBreakdown(tutor.pricePerHour, durationMins, feeConfig)
    : null;

  const handlePreview = async () => {
    if (daysOfWeek.length === 0) {
      setErrorMsg("Vui lòng chọn ít nhất 1 ngày trong tuần.");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    const sessions = await previewSeries({
      tutorId: tutor.id,
      daysOfWeek,
      startTime,
      durationMinutes: durationMins,
      startDate,
      occurrenceCount,
      subject: tutor.subjects?.[0] ?? "general",
      grade: tutor.grades?.[0] ?? "general",
      teachingMode: "OFFLINE",
      baseAmountPerSession: Math.round((tutor.pricePerHour * durationMins) / 60),
    });
    setPreviewSessions(sessions);
    setStep("preview");
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user) {
      setErrorMsg("Bạn cần đăng nhập để đặt lịch.");
      setStep("error");
      return;
    }

    setLoading(true);
    const result = await createSeries({
      tutorId: tutor.id,
      daysOfWeek,
      startTime,
      durationMinutes: durationMins,
      startDate,
      occurrenceCount,
      subject: tutor.subjects?.[0] ?? "general",
      grade: tutor.grades?.[0] ?? "general",
      teachingMode: "OFFLINE",
      baseAmountPerSession: Math.round((tutor.pricePerHour * durationMins) / 60),
    });
    setLoading(false);

    if (result.ok && result.series) {
      setSeriesId(result.series.id);
      setStep("success");
      return;
    }

    setConflicts((result.conflicts ?? []).map((b) => b.startAt));
    setErrorMsg(result.error ?? "Có lỗi xảy ra.");
    setStep("error");
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Repeat2 className="h-5 w-5 text-primary" />
            Đặt lịch định kỳ
          </DialogTitle>
          <DialogDescription>
            Gia sư: <span className="font-medium text-foreground">{tutor.fullName}</span>
          </DialogDescription>
        </DialogHeader>

        {step === "form" && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Chọn ngày trong tuần</label>
              <div className="flex flex-wrap gap-2">
                {DOW_LABELS.map((label, index) => {
                  const dayOfWeek = DOW_VALUES[index];
                  const selected = daysOfWeek.includes(dayOfWeek);
                  return (
                    <button
                      key={dayOfWeek}
                      onClick={() => toggleDay(dayOfWeek)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {errorMsg && daysOfWeek.length === 0 && (
                <p className="text-xs text-destructive">{errorMsg}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Giờ bắt đầu</label>
                <Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Thời lượng</label>
                <div className="flex gap-2">
                  {DURATION_OPTIONS.map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setDurationMins(duration)}
                      className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${
                        durationMins === duration
                          ? "border-primary bg-primary text-white"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {duration}p
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Ngày bắt đầu</label>
                <Input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-foreground">Số buổi</label>
                <Input
                  type="number"
                  min={2}
                  max={52}
                  value={occurrenceCount}
                  onChange={(event) => setOccurrenceCount(Number(event.target.value))}
                />
              </div>
            </div>

            {!fee ? (
              <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
                Đang tải cấu hình phí...
              </div>
            ) : (
              <div className="space-y-1.5 rounded-xl bg-muted p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Học phí / buổi</span>
                  <span>{formatCurrency(fee.baseAmount)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between font-semibold">
                  <span>Bạn thanh toán ({occurrenceCount} buổi)</span>
                  <span className="text-primary">{formatCurrency(fee.totalAmount * occurrenceCount)}</span>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button loading={loading || !feeConfig} onClick={handlePreview} className="w-full">
                Xem lịch dự kiến
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Hệ thống sẽ tạo <span className="font-semibold text-foreground">{previewSessions.length} buổi</span> theo lịch sau:
            </p>
            <div className="max-h-56 divide-y divide-border overflow-y-auto rounded-xl border border-border">
              {previewSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span className="font-medium">{format(parseBeDate(session.startAt), "EEE, dd/MM/yyyy")}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {format(parseBeDate(session.startAt), "HH:mm")} - {format(parseBeDate(session.endAt), "HH:mm")}
                  </span>
                </div>
              ))}
            </div>

            {fee && (
              <div className="rounded-xl bg-primary/10 p-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng học phí</span>
                  <span className="font-semibold text-primary">
                    {formatCurrency(fee.totalAmount * previewSessions.length)}
                  </span>
                </div>
              </div>
            )}

            {!user && (
              <div className="flex gap-2 rounded-lg bg-warning/15 p-3 text-sm text-warning-600">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                Bạn cần đăng nhập để xác nhận đặt lịch.
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("form")}>Chỉnh lại</Button>
              <Button loading={loading} onClick={handleCreate}>Xác nhận đặt lịch định kỳ</Button>
            </DialogFooter>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center space-y-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/15">
              <CheckCircle2 className="h-9 w-9 text-success" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">Đặt lịch định kỳ thành công</h3>
              <p className="text-sm text-muted-foreground">
                Lịch đang chờ gia sư xác nhận. Mã series: <span className="font-mono font-medium">{seriesId}</span>
              </p>
            </div>
            <Button onClick={onClose} className="w-full">Đóng</Button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center space-y-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-9 w-9 text-destructive" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold text-destructive">Có xung đột lịch</h3>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
            </div>
            {conflicts.length > 0 && (
              <div className="max-h-36 w-full space-y-1 overflow-y-auto rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-xs">
                {conflicts.map((item, index) => (
                  <div key={index} className="text-destructive">
                    {format(parseBeDate(item), "EEE dd/MM/yyyy HH:mm")}
                  </div>
                ))}
              </div>
            )}
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep("form");
                  setConflicts([]);
                  setErrorMsg("");
                }}
              >
                Chọn lại lịch
              </Button>
              <Button variant="destructive" className="flex-1" onClick={onClose}>Đóng</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
