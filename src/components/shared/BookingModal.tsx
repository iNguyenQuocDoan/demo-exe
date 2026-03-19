"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BookOpen, CalendarDays, CheckCircle2, MapPin, Phone, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { createBooking } from "@/api/bookingApi";
import { getFeeConfig, getSubjects } from "@/api/referenceApi";
import { initBookingEnhancement } from "@/lib/bookingEnhancedMock";
import { useAuthStore } from "@/store/useAuthStore";
import { formatCurrency } from "@/lib/utils";
import type { FeeConfig, FreeSlot, Subject, TutorProfile } from "@/types";

interface Props {
  tutor: TutorProfile;
  preSelectedSlot?: FreeSlot | null;
  onClose: () => void;
}

type Step = "selectSlot" | "fillGoal" | "fillContact" | "confirm" | "success" | "error";

const DURATION_MINS = 90;

const GOAL_TAGS = [
  "Củng cố nền tảng",
  "Ôn thi",
  "Luyện kỹ năng nói",
  "Bài tập về nhà",
  "Chuẩn bị thi ĐH",
  "Học trước chương trình",
] as const;

function computeFee(pricePerHour: number, durationMins: number, feeConfig: FeeConfig) {
  const baseAmount = Math.round((pricePerHour * durationMins) / 60);
  const platformFee =
    feeConfig.feeType === "PERCENT"
      ? Math.round((baseAmount * feeConfig.feeValue) / 100)
      : feeConfig.feeValue;
  return { baseAmount, platformFee, totalAmount: baseAmount }; // parent pays baseAmount only
}

function isInsufficientFundsError(err: string): boolean {
  return (
    err.includes("Số dư khả dụng không đủ") ||
    err.includes("Thiếu") ||
    err.includes("không đủ số dư")
  );
}

export function BookingModal({ tutor, preSelectedSlot, onClose }: Props) {
  const { user } = useAuthStore();
  const router = useRouter();

  const [step, setStep] = useState<Step>(preSelectedSlot ? "fillGoal" : "selectSlot");
  const [slot, setSlot] = useState<FreeSlot | null>(preSelectedSlot ?? null);

  // ── Goal step state ──────────────────────────────────────────────────────
  const [tutorSubjects, setTutorSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedSubjectName, setSelectedSubjectName] = useState("");
  const [selectedGrade, setSelectedGrade] = useState(tutor.grades?.[0] ?? "");
  const [parentGoal, setParentGoal] = useState("");
  const [goalTags, setGoalTags] = useState<string[]>([]);
  const [subjectError, setSubjectError] = useState("");
  const [goalError, setGoalError] = useState("");

  // ── Contact step state ───────────────────────────────────────────────────
  const [contactPhone, setContactPhone] = useState("");
  const [contactZalo, setContactZalo] = useState("");
  const [locationDistrict, setLocationDistrict] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationFullAddress, setLocationFullAddress] = useState("");
  const [districtError, setDistrictError] = useState("");

  // ── Confirm step state ───────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [insufficientFunds, setInsufficientFunds] = useState(false);
  const [bookingId, setBookingId] = useState("");
  const [feeConfig, setFeeConfig] = useState<FeeConfig | null>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([getFeeConfig(), getSubjects()]).then(([config, allSubjects]) => {
      if (!active) return;
      setFeeConfig(config);
      setTutorSubjects(allSubjects.filter((s) => tutor.subjects.includes(s.id)));
    });
    return () => {
      active = false;
    };
  }, [tutor.subjects]);

  // Auto-select when tutor teaches exactly one subject
  useEffect(() => {
    if (tutorSubjects.length === 1 && !selectedSubjectId) {
      setSelectedSubjectId(tutorSubjects[0].id);
      setSelectedSubjectName(tutorSubjects[0].name);
    }
  }, [tutorSubjects, selectedSubjectId]);

  const fee = slot && feeConfig
    ? computeFee(tutor.pricePerHour, DURATION_MINS, feeConfig)
    : null;

  const handleSelectSlot = (selected: FreeSlot) => {
    setSlot(selected);
    setStep("fillGoal");
  };

  const handleGoalNext = () => {
    let hasError = false;
    if (!selectedSubjectId) {
      setSubjectError("Vui lòng chọn môn học");
      hasError = true;
    } else if (!tutor.subjects.includes(selectedSubjectId)) {
      setSubjectError("Môn học không hợp lệ với gia sư này");
      hasError = true;
    }
    if (!parentGoal.trim()) {
      setGoalError("Vui lòng nhập mục tiêu buổi học");
      hasError = true;
    }
    if (hasError) return;
    setSubjectError("");
    setGoalError("");
    setStep("fillContact");
  };

  const handleContactNext = () => {
    if (!locationDistrict.trim()) {
      setDistrictError("Vui lòng nhập quận/huyện để gia sư biết khu vực");
      return;
    }
    setDistrictError("");
    setStep("confirm");
  };

  const handleSubmit = async () => {
    if (!slot || !feeConfig) return;
    if (!user) {
      setErrorMsg("Bạn cần đăng nhập để đặt lịch.");
      setInsufficientFunds(false);
      setStep("error");
      return;
    }

    setLoading(true);
    const result = await createBooking({
      tutorId: tutor.id,
      startAt: `${slot.date}T${slot.startTime}:00`,
      endAt: `${slot.date}T${slot.endTime}:00`,
      subject: selectedSubjectId,
      subjectName: selectedSubjectName,
      grade: selectedGrade || tutor.grades?.[0] || "general",
      teachingMode: "OFFLINE",
      parentGoal,
      goalTags,
      baseAmount: fee?.baseAmount ?? Math.round((tutor.pricePerHour * slot.duration) / 60),
    });
    setLoading(false);

    if (result.ok && result.booking) {
      initBookingEnhancement(result.booking, {
        contactPhone: contactPhone.trim() || undefined,
        contactZalo: contactZalo.trim() || undefined,
        locationDistrict: locationDistrict.trim() || undefined,
        locationCity: locationCity.trim() || undefined,
        locationFullAddress: locationFullAddress.trim() || undefined,
      });
      setBookingId(result.booking.id);
      setStep("success");
      return;
    }

    const errText = result.error ?? "Có lỗi xảy ra.";
    setInsufficientFunds(isInsufficientFundsError(errText));
    setErrorMsg(errText);
    setStep("error");
  };

  const handleGoToBookings = () => { onClose(); router.push("/parent/bookings"); };
  const handleGoToWallet = () => { onClose(); router.push("/parent/wallet"); };

  const toggleTag = (tag: string) =>
    setGoalTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );

  // 4-segment progress bar
  const STEPS: Step[] = ["selectSlot", "fillGoal", "fillContact", "confirm"];
  const stepIndex = STEPS.indexOf(step);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            Đặt buổi học
          </DialogTitle>
          <DialogDescription>
            Gia sư: <span className="font-medium text-foreground">{tutor.fullName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Progress bar */}
        {!["success", "error"].includes(step) && (
          <div className="mb-2 flex gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= stepIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        )}

        {/* ── Step 1: Select slot ──────────────────────────────────── */}
        {step === "selectSlot" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Chọn khung giờ phù hợp:</p>
            <AvailabilityCalendar
              tutorId={tutor.id}
              selectedSlot={slot}
              onSelectSlot={handleSelectSlot}
            />
          </div>
        )}

        {/* ── Step 2: Subject + goal ───────────────────────────────── */}
        {step === "fillGoal" && (
          <div className="space-y-4">
            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Môn học <span className="text-destructive">*</span>
              </label>
              {tutorSubjects.length === 0 ? (
                <p className="text-sm text-muted-foreground">Đang tải danh sách môn...</p>
              ) : (
                <select
                  title="Chọn môn học"
                  value={selectedSubjectId}
                  onChange={(e) => {
                    const sub = tutorSubjects.find((s) => s.id === e.target.value);
                    setSelectedSubjectId(e.target.value);
                    setSelectedSubjectName(sub?.name ?? "");
                    setSubjectError("");
                  }}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Chọn môn học...</option>
                  {tutorSubjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
              {subjectError && <p className="text-xs text-destructive">{subjectError}</p>}
            </div>

            {/* Grade — only when tutor has multiple */}
            {tutor.grades && tutor.grades.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Khối lớp</label>
                <select
                  title="Chọn khối lớp"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {tutor.grades.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Quick goal tags */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">
                Mục tiêu nhanh (tùy chọn)
              </label>
              <div className="flex flex-wrap gap-2">
                {GOAL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      goalTags.includes(tag)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Parent goal textarea — required */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Mục tiêu / ý muốn học{" "}
                <span className="text-destructive">*</span>
              </label>
              <textarea
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={3}
                placeholder="Ví dụ: Bé cần củng cố ngữ pháp lớp 6, luyện nói để chuẩn bị thi cuối kỳ..."
                value={parentGoal}
                maxLength={500}
                onChange={(e) => {
                  setParentGoal(e.target.value);
                  setGoalError("");
                }}
              />
              <div className="flex justify-between">
                {goalError ? (
                  <p className="text-xs text-destructive">{goalError}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-muted-foreground">{parentGoal.length}/500</p>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("selectSlot")}>
                Quay lại
              </Button>
              <Button onClick={handleGoalNext}>Tiếp theo</Button>
            </DialogFooter>
          </div>
        )}

        {/* ── Step 3: Contact & Location ───────────────────────────── */}
        {step === "fillContact" && (
          <div className="space-y-4">
            {/* Location — always OFFLINE */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <label className="text-sm font-medium text-foreground">
                  Khu vực học <span className="text-destructive">*</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">Gia sư cần biết khu vực để quyết định có thể dạy trực tiếp không.</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Quận/Huyện (VD: Quận 7)"
                  value={locationDistrict}
                  onChange={(e) => { setLocationDistrict(e.target.value); setDistrictError(""); }}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  placeholder="Thành phố (VD: TP.HCM)"
                  value={locationCity}
                  onChange={(e) => setLocationCity(e.target.value)}
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              {districtError && <p className="text-xs text-destructive">{districtError}</p>}
              <input
                type="text"
                placeholder="Địa chỉ cụ thể (tùy chọn)"
                value={locationFullAddress}
                onChange={(e) => setLocationFullAddress(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground">Địa chỉ đầy đủ sẽ chỉ hiển thị sau khi gia sư xác nhận.</p>
            </div>

            {/* Contact details */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-primary" />
                <label className="text-sm font-medium text-foreground">
                  Thông tin liên lạc{" "}
                  <span className="text-xs font-normal text-muted-foreground">(tùy chọn)</span>
                </label>
              </div>
              <input
                type="tel"
                placeholder="Số điện thoại (VD: 0909123456)"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                type="text"
                placeholder="Zalo (số điện thoại hoặc link Zalo)"
                value={contactZalo}
                onChange={(e) => setContactZalo(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <p className="text-xs text-muted-foreground">
                SĐT và Zalo sẽ được ẩn và chỉ hiển thị đầy đủ sau khi gia sư xác nhận.
              </p>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("fillGoal")}>Quay lại</Button>
              <Button onClick={handleContactNext}>Tiếp theo</Button>
            </DialogFooter>
          </div>
        )}

        {/* ── Step 4: Confirm ──────────────────────────────────────── */}
        {step === "confirm" && slot && (
          <div className="space-y-4">
            {/* Preview */}
            <div className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {selectedSubjectName || selectedSubjectId}
                </span>
                {goalTags.slice(0, 2).map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
              {parentGoal && (
                <p className="text-xs text-muted-foreground line-clamp-2">{parentGoal}</p>
              )}
              <div className="flex flex-wrap gap-4 border-t border-border/50 pt-2 text-xs text-muted-foreground">
                <span>{slot.date}</span>
                <span>{slot.startTime}–{slot.endTime}</span>
                {selectedGrade && <span>{selectedGrade}</span>}
                <span>Trực tiếp</span>
              </div>
            </div>

            {/* Fee */}
            {!fee ? (
              <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
                Đang tải cấu hình phí...
              </div>
            ) : (
              <div className="space-y-2 rounded-xl border border-border p-4">
                <h4 className="mb-3 text-sm font-semibold">Chi phí</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Học phí</span>
                  <span>{formatCurrency(fee.baseAmount)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between font-semibold">
                  <span>Bạn thanh toán</span>
                  <span className="text-primary">{formatCurrency(fee.totalAmount)}</span>
                </div>
              </div>
            )}

            {!user && (
              <div className="flex items-center gap-2 rounded-lg bg-warning/15 p-3 text-sm text-warning-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Bạn cần đăng nhập để xác nhận đặt lịch.
              </div>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setStep("fillContact")}>Quay lại</Button>
              <Button loading={loading || !feeConfig} onClick={handleSubmit}>
                Xác nhận đặt lịch
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* ── Success ──────────────────────────────────────────────── */}
        {step === "success" && (
          <div className="flex flex-col items-center space-y-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-success/15">
              <CheckCircle2 className="h-9 w-9 text-success" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold">Đặt lịch thành công!</h3>
              <p className="text-sm text-muted-foreground">
                Lịch đang chờ gia sư xác nhận. Mã lịch:{" "}
                <span className="font-mono font-medium">{bookingId.slice(-8)}</span>
              </p>
            </div>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>Đóng</Button>
              <Button className="flex-1" onClick={handleGoToBookings}>Xem lịch học</Button>
            </div>
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────── */}
        {step === "error" && (
          <div className="flex flex-col items-center space-y-4 py-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertCircle className="h-9 w-9 text-destructive" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-semibold text-destructive">
                {insufficientFunds ? "Số dư không đủ" : "Không thể đặt lịch"}
              </h3>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
            </div>
            {insufficientFunds ? (
              <div className="flex w-full gap-2">
                <Button variant="outline" className="flex-1" onClick={onClose}>Đóng</Button>
                <Button className="flex-1 gap-1.5" onClick={handleGoToWallet}>
                  <Wallet className="h-4 w-4" />
                  Nạp tiền
                </Button>
              </div>
            ) : (
              <div className="flex w-full gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setStep("fillGoal");
                    setErrorMsg("");
                    setInsufficientFunds(false);
                  }}
                >
                  Thử lại
                </Button>
                <Button variant="destructive" className="flex-1" onClick={onClose}>Đóng</Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
