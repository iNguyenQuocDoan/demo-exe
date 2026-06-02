import { realApiClient } from "@/lib/realApiClient";
import type { AppNotification, NotificationType } from "@/types";

export interface NotificationListResult {
  notifications: AppNotification[];
  unreadCount: number;
}

// ── BE shapes ────────────────────────────────────────────────────────────────
// GET /api/notifications/notifications → ApiResponse<PageResponse<Notification>>
// GET /api/notifications/unread-count   → ApiResponse<number>
interface BeNotification {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface BePage<T> {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalElements: number;
  data: T[];
}

interface BeApiResponse<T> {
  code: number;
  message: string;
  success: boolean;
  data: T;
}

// BE chỉ trả message (không có type/title) → suy ra type cho icon + tạo title VN.
function inferType(message: string): NotificationType {
  const m = message.toLowerCase();
  if (m.includes("đánh giá") || m.includes("review")) return "new_review";
  if (m.includes("nạp") || m.includes("deposit")) return "deposit_approved";
  if (m.includes("rút") || m.includes("withdraw")) return "withdraw_processed";
  if (m.includes("hồ sơ") || m.includes("duyệt") || m.includes("application"))
    return "application_approved";
  if (m.includes("huỷ") || m.includes("hủy") || m.includes("cancel"))
    return "booking_cancelled";
  if (m.includes("hoàn thành") || m.includes("complete")) return "booking_completed";
  return "booking_confirmed";
}

const TITLE_BY_TYPE: Record<NotificationType, string> = {
  booking_confirmed: "Lịch học",
  booking_cancelled: "Huỷ buổi học",
  booking_completed: "Buổi học hoàn thành",
  deposit_approved: "Nạp tiền",
  deposit_rejected: "Nạp tiền",
  withdraw_processed: "Rút tiền",
  new_review: "Đánh giá mới",
  report_created: "Báo cáo",
  report_resolved: "Báo cáo",
  application_approved: "Hồ sơ gia sư",
  application_rejected: "Hồ sơ gia sư",
  series_confirmed: "Lịch định kỳ",
};

function mapNotification(be: BeNotification): AppNotification {
  const type = inferType(be.message ?? "");
  return {
    id: be.id,
    userId: be.userId,
    type,
    title: TITLE_BY_TYPE[type] ?? "Thông báo",
    message: be.message ?? "",
    isRead: !!be.read,
    createdAt: be.createdAt,
  };
}

export async function getNotifications(params?: {
  limit?: number;
  unread?: boolean;
}): Promise<NotificationListResult> {
  try {
    const [listRes, countRes] = await Promise.all([
      realApiClient.get<BeApiResponse<BePage<BeNotification>>>(
        "/notifications/notifications",
        { params: { page: 1, size: params?.limit ?? 50 } },
      ),
      realApiClient.get<BeApiResponse<number>>("/notifications/unread-count"),
    ]);
    const page = listRes.data?.data;
    const notifications = (page?.data ?? []).map(mapNotification);
    return {
      notifications,
      unreadCount: countRes.data?.data ?? notifications.filter((n) => !n.isRead).length,
    };
  } catch {
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markRead(id: string): Promise<void> {
  try {
    await realApiClient.post(`/notifications/${id}/read`);
  } catch {
    // ignore — UI cập nhật lạc quan ở store
  }
}

export async function markAllRead(): Promise<void> {
  try {
    await realApiClient.post("/notifications/read-all");
  } catch {
    // ignore
  }
}

// BE chưa hỗ trợ xoá thông báo — no-op để không gãy UI.
export async function deleteNotification(_id: string): Promise<void> {
  return;
}
