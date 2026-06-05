/**
 * Registry trạng thái TẬP TRUNG cho toàn hệ thống — single source of truth để map
 * mọi status/type/state BE → nhãn tiếng Việt + Badge variant + icon.
 *
 * Dùng kèm <StatusBadge registry={...} value={...} /> (components/shared/StatusBadge.tsx).
 * Tham chiếu đầy đủ: docs/API_STATUS_INVENTORY.md
 */
import type { LucideIcon } from "lucide-react";
import {
  Clock,
  CheckCircle2,
  PlayCircle,
  UserCheck,
  BadgeCheck,
  XCircle,
  AlertTriangle,
  CircleDashed,
  ShieldCheck,
  ShieldX,
  CalendarCheck,
  CalendarX,
  Lock,
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  Undo2,
  Banknote,
  Percent,
} from "lucide-react";
import type {
  BookingStatus,
  TransactionType,
  TransactionStatus,
  DisputeReportStatus,
  ProfileStatus,
} from "@/types";

/** Các variant Badge hợp lệ (khớp components/ui/badge.tsx). */
export type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "destructive"
  | "info"
  | "outline";

export interface StatusMeta {
  label: string;
  variant: BadgeVariant;
  icon?: LucideIcon;
}

// ─── Booking lifecycle ────────────────────────────────────────────────────────
// BE: PENDING · CONFIRMED · PROCESSING · TUTOR_COMPLETED · PARENT_COMPLETED ·
//     COMPLETED · CANCELLED · DISPUTED · REJECTED(→Cancelled)
export const BOOKING_STATUS_META: Record<BookingStatus, StatusMeta> = {
  Pending: { label: "Chờ xác nhận", variant: "warning", icon: Clock },
  AwaitingPayment: { label: "Chờ thanh toán", variant: "warning", icon: Clock },
  Confirmed: { label: "Đã xác nhận", variant: "success", icon: CheckCircle2 },
  InProgress: { label: "Đang trong giờ học", variant: "info", icon: PlayCircle },
  TutorCompleted: { label: "Chờ phụ huynh xác nhận", variant: "warning", icon: UserCheck },
  ParentCompleted: { label: "Chờ gia sư xác nhận", variant: "warning", icon: UserCheck },
  Completed: { label: "Hoàn thành", variant: "success", icon: BadgeCheck },
  Cancelled: { label: "Đã hủy", variant: "destructive", icon: XCircle },
  Disputed: { label: "Tranh chấp", variant: "destructive", icon: AlertTriangle },
  Resolved: { label: "Đã giải quyết", variant: "secondary", icon: CheckCircle2 },
};

/** Nhãn booking theo góc nhìn người xem (chỉ khác ở các trạng thái "chờ phía kia"). */
export function bookingStatusMeta(
  status: BookingStatus,
  viewer?: "parent" | "tutor",
): StatusMeta {
  const base = BOOKING_STATUS_META[status] ?? {
    label: status,
    variant: "secondary" as const,
  };
  if (viewer === "parent" && status === "TutorCompleted")
    return { ...base, label: "Chờ bạn xác nhận" };
  if (viewer === "tutor" && status === "ParentCompleted")
    return { ...base, label: "Chờ bạn xác nhận" };
  return base;
}

// ─── Wallet transaction type ──────────────────────────────────────────────────
// FE type ← BE: DEPOSIT, WITHDRAW, PAYMENT(→BOOKING_CHARGE), RECEIVE(→TUTOR_PAYOUT),
//               REFUND, COMMISSION(→PLATFORM_FEE).
export type TxDirection = "credit" | "debit";
export interface TxTypeMeta extends StatusMeta {
  direction: TxDirection;
}
export const TRANSACTION_TYPE_META: Record<TransactionType, TxTypeMeta> = {
  DEPOSIT: { label: "Nạp tiền", variant: "success", icon: ArrowDownToLine, direction: "credit" },
  WITHDRAW: { label: "Rút tiền", variant: "secondary", icon: Banknote, direction: "debit" },
  BOOKING_HOLD: { label: "Giữ tiền đặt lịch", variant: "warning", icon: ArrowUpFromLine, direction: "debit" },
  BOOKING_CHARGE: { label: "Thanh toán học phí", variant: "warning", icon: ArrowUpFromLine, direction: "debit" },
  REFUND: { label: "Hoàn tiền", variant: "info", icon: Undo2, direction: "credit" },
  TUTOR_PAYOUT: { label: "Nhận tiền dạy", variant: "success", icon: Wallet, direction: "credit" },
  PLATFORM_FEE: { label: "Phí nền tảng", variant: "secondary", icon: Percent, direction: "debit" },
};

/**
 * Tính hiển thị số tiền cho 1 giao dịch: dấu (+/−), giá trị tuyệt đối, màu.
 * Ưu tiên `direction` của type (ổn định hơn dấu của amount do BE trả không nhất quán).
 */
export function txDisplay(type: TransactionType, amount: number) {
  const direction = TRANSACTION_TYPE_META[type]?.direction ?? (amount < 0 ? "debit" : "credit");
  const isCredit = direction === "credit";
  return {
    isCredit,
    sign: isCredit ? "+" : "-",
    value: Math.abs(amount),
    colorClass: isCredit ? "text-green-600" : "text-orange-600",
  };
}

// ─── Wallet transaction status ────────────────────────────────────────────────
// BE: PENDING · SUCCESS(→Completed) · FAILED. (FE còn Cancelled cho tương thích.)
export const TRANSACTION_STATUS_META: Record<TransactionStatus, StatusMeta> = {
  Pending: { label: "Đang xử lý", variant: "warning", icon: Clock },
  Completed: { label: "Thành công", variant: "success", icon: CheckCircle2 },
  Failed: { label: "Thất bại", variant: "destructive", icon: XCircle },
  Cancelled: { label: "Đã hủy", variant: "secondary", icon: XCircle },
};

// ─── Withdraw status (cùng kiểu TransactionStatus nhưng nhãn theo ngữ cảnh rút tiền) ──
// BE WithdrawalStatus: PENDING(→Pending) · APPROVED(→Completed) · REJECTED(→Failed).
export const WITHDRAW_STATUS_META: Record<TransactionStatus, StatusMeta> = {
  Pending: { label: "Chờ duyệt", variant: "warning", icon: Clock },
  Completed: { label: "Đã duyệt", variant: "success", icon: CheckCircle2 },
  Failed: { label: "Từ chối", variant: "destructive", icon: XCircle },
  Cancelled: { label: "Đã hủy", variant: "secondary", icon: XCircle },
};

// ─── Dispute status ───────────────────────────────────────────────────────────
// BE DisputeStatus: PENDING · RESOLVED · REJECTED(→Dismissed). FE còn Reviewing (không dùng với BE).
export const DISPUTE_STATUS_META: Record<DisputeReportStatus, StatusMeta> = {
  Pending: { label: "Chờ xử lý", variant: "warning", icon: AlertTriangle },
  Reviewing: { label: "Đang xem xét", variant: "info", icon: Clock },
  Resolved: { label: "Đã giải quyết", variant: "success", icon: CheckCircle2 },
  Dismissed: { label: "Không hợp lệ", variant: "secondary", icon: XCircle },
};

// ─── Tutor profile verification ───────────────────────────────────────────────
// FE ProfileStatus ← BE VerificationStatus: NOT_VERIFIED(→Draft) · PENDING(→PendingReview) ·
//                    APPROVED(→Approved) · REJECTED(→Rejected). (Suspended chỉ FE.)
export const PROFILE_STATUS_META: Record<ProfileStatus, StatusMeta> = {
  Draft: { label: "Chưa xác minh", variant: "secondary", icon: CircleDashed },
  PendingReview: { label: "Chờ duyệt", variant: "warning", icon: Clock },
  Approved: { label: "Đã xác minh", variant: "success", icon: ShieldCheck },
  Rejected: { label: "Bị từ chối", variant: "destructive", icon: ShieldX },
  Suspended: { label: "Tạm khóa", variant: "destructive", icon: Lock },
};

// ─── Tutor slot status (BE raw value) ─────────────────────────────────────────
export type SlotStatusValue = "AVAILABLE" | "BOOKED" | "LOCKED";
export const SLOT_STATUS_META: Record<SlotStatusValue, StatusMeta> = {
  AVAILABLE: { label: "Còn trống", variant: "success", icon: CalendarCheck },
  BOOKED: { label: "Đã đặt", variant: "secondary", icon: CalendarX },
  LOCKED: { label: "Đã khóa", variant: "warning", icon: Lock },
};

// ─── Account active flag ──────────────────────────────────────────────────────
export const ACCOUNT_STATUS_META = {
  active: { label: "Đang hoạt động", variant: "success", icon: CheckCircle2 } as StatusMeta,
  blocked: { label: "Đã khóa", variant: "destructive", icon: Lock } as StatusMeta,
};
