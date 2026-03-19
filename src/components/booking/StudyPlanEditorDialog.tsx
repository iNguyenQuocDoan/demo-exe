"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { BookingEnhancement } from "@/lib/bookingEnhancedMock";
import type { SavePlanInput } from "@/api/bookingEnhancedApi";

interface StudyPlanEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enhancement: BookingEnhancement;
  onSaveDraft: (input: SavePlanInput) => Promise<void>;
  onSendPlan: (input: SavePlanInput) => Promise<void>;
}

interface FormState {
  overview: string;
  duration: string;
  roadmap: string;
  objectives: string;
  materials: string;
  homework: string;
  progressMeasure: string;
  scheduleSuggestions: string;
  tutorNotes: string;
  offlineTravelHint: string;
  offlinePreparationReminder: string;
}

function buildInitialForm(enhancement: BookingEnhancement): FormState {
  const plan = enhancement.studyPlan;
  if (!plan) {
    return {
      overview: "",
      duration: "4 tuần",
      roadmap: "Tuần 1: Đánh giá nền tảng\nTuần 2: Kỹ năng cốt lõi\nTuần 3: Luyện tập có hướng dẫn\nTuần 4: Ôn tập và đánh giá",
      objectives: "Cải thiện độ lưu loát\nTăng tự tin khi học",
      materials: "Bộ bài tập số 01\nSlide tham khảo",
      homework: "Luyện ghi âm 3 phút mỗi ngày",
      progressMeasure: "Đánh giá theo tuần",
      scheduleSuggestions: "Thứ 3 19:00-20:30\nThứ 5 19:00-20:30",
      tutorNotes: "",
      offlineTravelHint: "",
      offlinePreparationReminder: "",
    };
  }

  return {
    overview: plan.overview,
    duration: plan.duration,
    roadmap: plan.weeklyPlans.map((item) => `Tuần ${item.weekNumber}: ${item.topics.join(", ")}`).join("\n"),
    objectives: plan.weeklyPlans[0]?.objectives.join("\n") ?? "",
    materials: (plan.materialsNeeded ?? []).join("\n"),
    homework: plan.weeklyPlans[0]?.homework?.join("\n") ?? "",
    progressMeasure: plan.weeklyPlans[0]?.assessmentMethod ?? "",
    scheduleSuggestions: plan.suggestedSchedule?.sessions
      ?.map((item) => `${item.date} ${item.startTime}-${item.endTime} · ${item.topic}`)
      .join("\n") ?? "",
    tutorNotes: plan.tutorNotes ?? "",
    offlineTravelHint: "",
    offlinePreparationReminder: "",
  };
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function StudyPlanEditorDialog({
  open,
  onOpenChange,
  enhancement,
  onSaveDraft,
  onSendPlan,
}: StudyPlanEditorDialogProps) {
  const [form, setForm] = useState<FormState>(buildInitialForm(enhancement));
  const [submitting, setSubmitting] = useState<"draft" | "send" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(buildInitialForm(enhancement));
    setError(null);
    setSubmitting(null);
  }, [enhancement, open]);

  const parsed = useMemo(() => {
    const roadmapLines = splitLines(form.roadmap);
    return {
      roadmapLines,
      objectives: splitLines(form.objectives),
      materials: splitLines(form.materials),
      homework: splitLines(form.homework),
    };
  }, [form]);

  const toInput = (): SavePlanInput | null => {
    if (!form.overview.trim()) {
      setError("Vui lòng nhập tổng quan cho kế hoạch học.");
      return null;
    }
    if (parsed.roadmapLines.length === 0) {
      setError("Vui lòng nhập ít nhất 1 dòng lộ trình tuần học.");
      return null;
    }

    setError(null);
    return {
      bookingId: enhancement.bookingId,
      overview: form.overview.trim(),
      duration: form.duration.trim() || "4 tuần",
      roadmapLines: parsed.roadmapLines,
      objectives: parsed.objectives,
      materials: parsed.materials,
      homework: parsed.homework,
      progressMeasure: form.progressMeasure.trim() || "Đánh giá hàng tuần",
      scheduleSuggestions: form.scheduleSuggestions.trim(),
      tutorNotes: form.tutorNotes.trim(),
      offlineTravelHint: form.offlineTravelHint.trim(),
      offlinePreparationReminder: form.offlinePreparationReminder.trim(),
    };
  };

  const handleDraft = async () => {
    const input = toInput();
    if (!input) return;

    setSubmitting("draft");
    try {
      await onSaveDraft(input);
      onOpenChange(false);
    } finally {
      setSubmitting(null);
    }
  };

  const handleSend = async () => {
    const input = toInput();
    if (!input) return;

    setSubmitting("send");
    try {
      await onSendPlan(input);
      onOpenChange(false);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Kế hoạch học tập</DialogTitle>
          <DialogDescription>
            Soạn lộ trình, nội dung, tài liệu, bài tập và cách đo tiến độ.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Tổng quan kế hoạch</span>
            <textarea
              value={form.overview}
              onChange={(event) => setForm((prev) => ({ ...prev, overview: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Mô tả mục tiêu tổng quát của kế hoạch học"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Thời lượng</span>
            <input
              value={form.duration}
              onChange={(event) => setForm((prev) => ({ ...prev, duration: event.target.value }))}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              placeholder="Ví dụ: 4 tuần"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Đo lường tiến độ</span>
            <input
              value={form.progressMeasure}
              onChange={(event) => setForm((prev) => ({ ...prev, progressMeasure: event.target.value }))}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              placeholder="Ví dụ: đánh giá hàng tuần"
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Lộ trình theo tuần</span>
            <textarea
              value={form.roadmap}
              onChange={(event) => setForm((prev) => ({ ...prev, roadmap: event.target.value }))}
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder={"Tuần 1: ...\nTuần 2: ..."}
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Mục tiêu học</span>
            <textarea
              value={form.objectives}
              onChange={(event) => setForm((prev) => ({ ...prev, objectives: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Mỗi dòng một mục tiêu"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Tài liệu cần chuẩn bị</span>
            <textarea
              value={form.materials}
              onChange={(event) => setForm((prev) => ({ ...prev, materials: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Mỗi dòng một tài liệu"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Bài tập về nhà</span>
            <textarea
              value={form.homework}
              onChange={(event) => setForm((prev) => ({ ...prev, homework: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Mỗi dòng một bài tập"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Gợi ý lịch học</span>
            <textarea
              value={form.scheduleSuggestions}
              onChange={(event) => setForm((prev) => ({ ...prev, scheduleSuggestions: event.target.value }))}
              rows={3}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Thứ 3 19:00-20:30"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Ước tính di chuyển (học trực tiếp)</span>
            <input
              value={form.offlineTravelHint}
              onChange={(event) => setForm((prev) => ({ ...prev, offlineTravelHint: event.target.value }))}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              placeholder="Ví dụ: khoảng 25 phút từ nhà gia sư"
            />
          </label>

          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Nhắc chuẩn bị (học trực tiếp)</span>
            <input
              value={form.offlinePreparationReminder}
              onChange={(event) => setForm((prev) => ({ ...prev, offlinePreparationReminder: event.target.value }))}
              className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
              placeholder="Ví dụ: mang theo vở và bút"
            />
          </label>

          <label className="space-y-1 sm:col-span-2">
            <span className="text-xs font-medium text-muted-foreground">Ghi chú của gia sư</span>
            <textarea
              value={form.tutorNotes}
              onChange={(event) => setForm((prev) => ({ ...prev, tutorNotes: event.target.value }))}
              rows={2}
              className="w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm"
              placeholder="Tùy chọn"
            />
          </label>

          {error ? (
            <p className="sm:col-span-2 text-xs text-destructive">{error}</p>
          ) : null}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button variant="outline" loading={submitting === "draft"} onClick={handleDraft}>
            Lưu nháp
          </Button>
          <Button loading={submitting === "send"} onClick={handleSend}>
            Gửi kế hoạch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
