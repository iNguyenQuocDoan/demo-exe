import Link from "next/link";
import {
  AlertCircle,
  ArrowRightLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Route,
  UserCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FLOW_STATUS_META,
  FLOW_TIMELINE,
  formatContactOwnerRole,
  type BookingEnhancement,
  type BookingFlowStatus,
} from "@/lib/bookingEnhancedMock";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ContactPreference } from "@/types/booking-enhanced";

function SectionHeading({
  icon: Icon,
  title,
  right,
}: {
  icon: LucideIcon;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      </div>
      {right}
    </div>
  );
}

export function BookingFlowBadge({
  status,
  className,
}: {
  status: BookingFlowStatus;
  className?: string;
}) {
  const meta = FLOW_STATUS_META[status];
  return (
    <Badge variant={meta.variant} className={className}>
      {meta.labelVi}
    </Badge>
  );
}

export function BookingStatusTimeline({ status }: { status: BookingFlowStatus }) {
  const activeIndex = FLOW_TIMELINE.indexOf(status);

  return (
    <div className="surface-card p-5 space-y-4">
      <SectionHeading icon={Route} title="Tiến trình booking" />
      <ol className="space-y-3">
        {FLOW_TIMELINE.map((step, index) => {
          const meta = FLOW_STATUS_META[step];
          const done = index < activeIndex;
          const current = index === activeIndex;
          return (
            <li key={step} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs",
                  done && "border-primary bg-primary text-primary-foreground",
                  current && "border-primary text-primary",
                  !done && !current && "border-border text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <p className={cn("text-sm", current ? "font-semibold text-foreground" : "text-muted-foreground")}>
                  {meta.labelVi}
                </p>
                {current && (
                  <Badge variant="outline" className="h-4 px-1.5 text-[10px] text-primary border-primary">
                    Hiện tại
                  </Badge>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ContactOwnerCard({
  enhancement,
  latestOwnerChange,
}: {
  enhancement: BookingEnhancement;
  latestOwnerChange: string | null;
}) {
  const owner = enhancement.currentContactOwner;

  return (
    <div className="surface-card p-5 space-y-3">
      <SectionHeading icon={UserCircle2} title="Người phụ trách liên lạc" />
      <div className="rounded-xl border border-border bg-muted/20 p-3">
        <p className="text-sm font-semibold text-foreground">{owner.name}</p>
        <p className="text-xs text-muted-foreground">{formatContactOwnerRole(owner.role)}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Phụ trách từ: {new Date(owner.assignedAt).toLocaleString("vi-VN")}
        </p>
      </div>

      {latestOwnerChange ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
          <p className="font-semibold">Người phụ trách đã thay đổi</p>
          <p>{latestOwnerChange}</p>
        </div>
      ) : null}
    </div>
  );
}

export function BookingContextCard({
  bookingId,
  status,
  contactOwnerText,
  bookingHref,
}: {
  bookingId: string;
  status: BookingFlowStatus;
  contactOwnerText: string;
  bookingHref?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">Thông tin booking</p>
          <p className="text-sm font-semibold text-foreground">#{bookingId}</p>
        </div>
        <BookingFlowBadge status={status} className="text-[11px]" />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <UserCircle2 className="h-3.5 w-3.5" />
        <span>Đang nhắn tin với: {contactOwnerText}</span>
      </div>
      {bookingHref ? (
        <div className="mt-3">
          <Button asChild variant="outline" size="sm" className="h-8 text-xs">
            <Link href={bookingHref}>Xem chi tiết booking</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}

const CONTACT_METHOD_LABELS: Record<
  ContactPreference["method"],
  {
    vi: string;
    icon: LucideIcon;
  }
> = {
  IN_APP_CHAT: { vi: "Chat trong app", icon: MessageSquare },
  PHONE: { vi: "Điện thoại", icon: Phone },
  ZALO: { vi: "Zalo", icon: MessageSquare },
  EMAIL: { vi: "Email", icon: Mail },
};

function maskValue(method: ContactPreference["method"], value?: string): string {
  if (!value) return "—";
  if (method === "PHONE") return value.replace(/\d(?=\d{3})/g, "x");
  if (method === "EMAIL") {
    const [name, domain] = value.split("@");
    if (!domain || !name) return "—";
    return `${name[0]}***@${domain}`;
  }
  if (method === "ZALO") return "—";
  return "Chat trong app";
}

function renderMethodAction(method: ContactPreference["method"], value?: string) {
  if (!value) return null;

  if (method === "PHONE") {
    return (
      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
        <a href={`tel:${value}`}>Gọi ngay</a>
      </Button>
    );
  }

  if (method === "EMAIL") {
    return (
      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
        <a href={`mailto:${value}`}>Gửi email</a>
      </Button>
    );
  }

  if (method === "ZALO") {
    const href = value.startsWith("http") ? value : `https://zalo.me/${value}`;
    return (
      <Button asChild variant="outline" size="sm" className="h-8 text-xs">
        <a href={href} target="_blank" rel="noreferrer">
          Mở Zalo
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </Button>
    );
  }

  return null;
}

export function ContactMethodCard({
  contactPreferences,
  isSensitiveVisible,
}: {
  contactPreferences: ContactPreference[];
  isSensitiveVisible: boolean;
}) {
  const sorted = [...contactPreferences].sort((a, b) => a.priority - b.priority);

  return (
    <div className="surface-card p-5 space-y-3">
      <SectionHeading icon={Phone} title="Phương thức liên lạc" />
      {sorted.map((item) => {
        const info = CONTACT_METHOD_LABELS[item.method];
        const Icon = info.icon;
        const value = isSensitiveVisible ? item.value : maskValue(item.method, item.value);

        return (
          <div key={`${item.method}_${item.priority}`} className="rounded-xl border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium text-foreground">{info.vi}</p>
                {item.priority === 1 ? <Badge variant="success">Ưu tiên</Badge> : null}
              </div>
              {isSensitiveVisible ? renderMethodAction(item.method, item.value) : null}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {item.method === "IN_APP_CHAT" ? "Chat trong app" : (value ?? "—")}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function getTeachingModeLabel(_mode?: string): string {
  return "Trực tiếp";
}

function getSessionTypeLabel(type?: string): string {
  if (type === "ONE_ON_ONE") return "1-1 (cá nhân)";
  if (type === "GROUP") return "Nhóm";
  return "Linh hoạt";
}

const GOAL_LABEL: Record<string, string> = {
  IMPROVE_GRADES: "Cải thiện điểm số",
  EXAM_PREP: "Ôn thi",
  CATCH_UP: "Theo kịp chương trình",
  ENRICHMENT: "Nâng cao",
  COMPETITION_PREP: "Luyện thi học sinh giỏi",
  HOMEWORK_HELP: "Hỗ trợ bài tập",
};

export function ParentPreferencesCard({
  enhancement,
}: {
  enhancement: BookingEnhancement;
}) {
  const pref = enhancement.learningPreferences;
  const goals = pref.goals.map((goal) => GOAL_LABEL[goal] ?? goal);

  return (
    <div className="surface-card p-5 space-y-3">
      <SectionHeading icon={ClipboardList} title="Yêu cầu học" />
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Hình thức</p>
          <p className="text-sm font-medium text-foreground">{getTeachingModeLabel(pref.teachingMode)}</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Loại buổi học</p>
          <p className="text-sm font-medium text-foreground">{getSessionTypeLabel(pref.sessionType)}</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Trình độ hiện tại</p>
          <p className="text-sm font-medium text-foreground">{pref.studentLevel ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Tần suất</p>
          <p className="text-sm font-medium text-foreground">{pref.frequency ?? "—"}</p>
        </div>
      </div>

      <div>
        <p className="mb-1.5 text-xs text-muted-foreground">Mục tiêu</p>
        <div className="flex flex-wrap gap-2">
          {goals.map((goal) => (
            <Badge key={goal} variant="outline">
              {goal}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground">Lịch ưu tiên</p>
        <p className="text-sm text-foreground">
          {(pref.preferredSchedule?.daysOfWeek ?? []).join(", ") || "—"} · {(pref.preferredSchedule?.timeSlots ?? []).join(", ") || "—"}
        </p>
      </div>

      {pref.notes ? (
        <div className="rounded-xl border border-border bg-muted/20 p-3">
          <p className="text-xs text-muted-foreground">Ghi chú</p>
          <p className="text-sm text-foreground">{pref.notes}</p>
        </div>
      ) : null}
    </div>
  );
}

export function LocationCard({
  enhancement,
  isSensitiveVisible,
  isTutorView,
}: {
  enhancement: BookingEnhancement;
  isSensitiveVisible: boolean;
  isTutorView?: boolean;
}) {
  const location = enhancement.locationInfo;

  return (
    <div className="surface-card p-5 space-y-3">
      <SectionHeading icon={MapPin} title="Địa điểm học" />
      <div className="flex items-start gap-2 rounded-xl border border-border p-3">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="text-xs text-muted-foreground">Khu vực</p>
          <p className="text-sm text-foreground">
            {location.district ?? "—"}, {location.city ?? "—"}
          </p>
        </div>
      </div>

      {!isSensitiveVisible ? (
        <Alert variant={isTutorView ? "default" : "warning"}>
          <AlertTitle>
            {isTutorView ? "Địa chỉ đầy đủ chưa hiển thị" : "Thông tin chi tiết đang bị ẩn"}
          </AlertTitle>
          <AlertDescription>
            {isTutorView
              ? "Xác nhận booking để xem địa chỉ chi tiết của phụ huynh."
              : "Địa chỉ chi tiết chỉ hiển thị sau khi Gia sư xác nhận booking."}
          </AlertDescription>
        </Alert>
      ) : null}

      {isSensitiveVisible && location.fullAddress ? (
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Địa chỉ đầy đủ</p>
          <p className="text-sm text-foreground">{location.fullAddress}</p>
          {location.travelTimeEstimate ? (
            <p className="mt-1 text-xs text-muted-foreground">
              <Route className="mr-1 inline h-3.5 w-3.5" />
              Ước tính di chuyển: ~{location.travelTimeEstimate} phút
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function StudyPlanCard({
  enhancement,
}: {
  enhancement: BookingEnhancement;
}) {
  const plan = enhancement.studyPlan;

  if (!plan) {
    return (
      <div className="surface-card p-5 space-y-3">
        <SectionHeading icon={BookOpen} title="Kế hoạch học" />
        <Alert>
          <AlertTitle>Chưa có kế hoạch học</AlertTitle>
          <AlertDescription>
            Gia sư chưa gửi kế hoạch. Kế hoạch sẽ được gửi sau khi xác nhận booking.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="surface-card p-5 space-y-3">
      <SectionHeading
        icon={BookOpen}
        title="Kế hoạch học"
        right={<Badge variant="outline" className="text-xs">{plan.status}</Badge>}
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Tổng quan</p>
          <p className="text-sm text-foreground">{plan.overview}</p>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-xs text-muted-foreground">Thời lượng</p>
          <p className="text-sm text-foreground">{plan.duration}</p>
        </div>
      </div>

      <Separator />

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Kế hoạch theo tuần</p>
        <div className="space-y-2">
          {plan.weeklyPlans.map((week) => (
            <details
              key={week.weekNumber}
              className="group rounded-xl border border-border overflow-hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 hover:bg-muted/40 transition-colors">
                <span className="text-sm font-medium text-foreground">Tuần {week.weekNumber}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-border bg-muted/20 px-3 py-3 space-y-1.5">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Chủ đề:</span>{" "}
                  {week.topics.join(", ")}
                </p>
                {week.assessmentMethod ? (
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Đánh giá:</span>{" "}
                    {week.assessmentMethod}
                  </p>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </div>

      {plan.materialsNeeded && plan.materialsNeeded.length > 0 ? (
        <div>
          <p className="mb-1 text-xs text-muted-foreground">Tài liệu cần chuẩn bị</p>
          <p className="text-sm text-foreground">{plan.materialsNeeded.join(", ")}</p>
        </div>
      ) : null}
    </div>
  );
}

export function PrivacyNotice({
  onConfirmHref,
  isTutorView,
}: {
  onConfirmHref?: string;
  isTutorView?: boolean;
}) {
  if (isTutorView) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Xác nhận để mở khóa thông tin liên lạc</AlertTitle>
        <AlertDescription>
          Khu vực học, môn học và mục tiêu đã hiển thị. SĐT, Zalo và địa chỉ đầy đủ sẽ hiển thị sau khi bạn xác nhận.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="warning">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Thông tin chi tiết đang bị ẩn</AlertTitle>
      <AlertDescription>
        Trước khi Gia sư xác nhận, hệ thống chỉ hiển thị khu vực tổng quát và thông tin liên lạc đã ẩn.
      </AlertDescription>
      {onConfirmHref ? (
        <div className="mt-3">
          <Button asChild size="sm" className="h-8 text-xs">
            <Link href={onConfirmHref}>Xác nhận booking</Link>
          </Button>
        </div>
      ) : null}
    </Alert>
  );
}

export function ChatOwnerChangeNote({ latestOwnerChange }: { latestOwnerChange: string | null }) {
  if (!latestOwnerChange) return null;

  return (
    <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] text-amber-900">
      <ArrowRightLeft className="h-3 w-3" />
      Người phụ trách liên lạc đã thay đổi: {latestOwnerChange}
    </div>
  );
}

export function BookingMetaRow({
  bookingId,
  startAt,
}: {
  bookingId: string;
  startAt: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        <CalendarClock className="h-3.5 w-3.5" />
        Booking #{bookingId}
      </span>
      <span>{new Date(startAt).toLocaleString("vi-VN")}</span>
    </div>
  );
}

export function CompletionConfirmCard({
  flowStatus,
  completionConfirmation,
  role,
  onConfirm,
  loading,
}: {
  flowStatus: BookingFlowStatus;
  completionConfirmation?: import("@/types/booking-enhanced").CompletionConfirmation;
  role: "parent" | "tutor";
  onConfirm: () => void;
  loading: boolean;
}) {
  const isVisible = flowStatus === "in_session" || flowStatus === "awaiting_completion";
  if (!isVisible) return null;

  const parentConfirmed = completionConfirmation?.parentConfirmed ?? false;
  const tutorConfirmed = completionConfirmation?.tutorConfirmed ?? false;
  const thisRoleConfirmed = role === "parent" ? parentConfirmed : tutorConfirmed;
  const bothConfirmed = parentConfirmed && tutorConfirmed;

  return (
    <div className="surface-card p-5 space-y-4">
      <SectionHeading icon={CheckCircle2} title="Xác nhận hoàn thành buổi học" />

      {/* Confirmation checklist */}
      <div className="space-y-2">
        <div className={cn(
          "flex items-center gap-2 text-sm px-3 py-2 rounded-lg",
          tutorConfirmed ? "bg-green-50 text-green-800" : "bg-muted text-muted-foreground",
        )}>
          {tutorConfirmed
            ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            : <Clock className="h-4 w-4 shrink-0" />}
          <span>Gia sư đã xác nhận{tutorConfirmed && completionConfirmation?.tutorConfirmedAt
            ? ` lúc ${new Date(completionConfirmation.tutorConfirmedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
            : ""}
          </span>
        </div>
        <div className={cn(
          "flex items-center gap-2 text-sm px-3 py-2 rounded-lg",
          parentConfirmed ? "bg-green-50 text-green-800" : "bg-muted text-muted-foreground",
        )}>
          {parentConfirmed
            ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            : <Clock className="h-4 w-4 shrink-0" />}
          <span>Phụ huynh đã xác nhận{parentConfirmed && completionConfirmation?.parentConfirmedAt
            ? ` lúc ${new Date(completionConfirmation.parentConfirmedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`
            : ""}
          </span>
        </div>
      </div>

      {/* Info text */}
      {!bothConfirmed && (
        <p className="text-sm text-muted-foreground">
          Cả hai bên cần xác nhận để hoàn thành buổi học và thực hiện thanh toán.
        </p>
      )}

      {/* Confirm button */}
      {!thisRoleConfirmed && (
        <Button className="w-full gap-2" loading={loading} onClick={onConfirm}>
          <CheckCircle2 className="h-4 w-4" />
          Xác nhận hoàn thành buổi học
        </Button>
      )}

      {thisRoleConfirmed && !bothConfirmed && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Bạn đã xác nhận. Đang chờ{" "}
          {role === "tutor" ? "phụ huynh" : "gia sư"} xác nhận để hoàn tất.
        </div>
      )}

      {/* Dispute warning */}
      <Alert variant="warning" className="border-amber-200 bg-amber-50">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-xs text-amber-800">
          Nếu một bên không xác nhận, buổi học có thể bị đưa vào quy trình giải quyết tranh chấp.
        </AlertDescription>
      </Alert>
    </div>
  );
}
