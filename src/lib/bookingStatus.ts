import type { BookingStatus } from "@/types";

/** Nhãn + variant hiển thị cho trạng thái booking lấy thẳng từ BE. */
export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; variant: "default" | "warning" | "success" | "destructive" | "secondary" }
> = {
  Pending:         { label: "Chờ xác nhận",       variant: "warning" },
  AwaitingPayment: { label: "Chờ thanh toán",     variant: "warning" },
  Confirmed:       { label: "Đã xác nhận",         variant: "success" },
  InProgress:      { label: "Đang trong giờ học",  variant: "default" },
  Completed:       { label: "Hoàn thành",          variant: "success" },
  Cancelled:       { label: "Đã hủy",              variant: "destructive" },
  Disputed:        { label: "Tranh chấp",          variant: "destructive" },
  Resolved:        { label: "Đã giải quyết",       variant: "secondary" },
};
