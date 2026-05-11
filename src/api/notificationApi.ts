import { apiClient } from "@/lib/apiClient";
import type { AppNotification } from "@/types";

export interface NotificationListResult {
  notifications: AppNotification[];
  unreadCount: number;
}

export async function getNotifications(params?: {
  limit?: number;
  unread?: boolean;
}): Promise<NotificationListResult> {
  try {
    const res = await apiClient.get<{
      ok: boolean;
      notifications: AppNotification[];
      unreadCount: number;
    }>("/notifications", { params });
    return {
      notifications: res.data.notifications ?? [],
      unreadCount: res.data.unreadCount ?? 0,
    };
  } catch {
    return { notifications: [], unreadCount: 0 };
  }
}

export async function markRead(id: string): Promise<void> {
  try {
    await apiClient.put(`/notifications/${id}/read`);
  } catch {
    await apiClient.post(`/notifications/${id}/read`);
  }
}

export async function markAllRead(): Promise<void> {
  try {
    await apiClient.put("/notifications/read-all");
  } catch {
    await apiClient.post("/notifications/read-all");
  }
}

export async function deleteNotification(id: string): Promise<void> {
  try {
    await apiClient.delete(`/notifications/${id}`);
  } catch {
    // ignore
  }
}
