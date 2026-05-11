import { create } from "zustand";
import type { AppNotification } from "@/types";
import { getNotifications, markRead, markAllRead } from "@/api/notificationApi";

interface NotificationState {
  notifications: AppNotification[];
  loading: boolean;
  fetch: () => Promise<void>;
  markOne: (id: string) => Promise<void>;
  markAll: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const result = await getNotifications();
      set({ notifications: result.notifications });
    } catch {
      // silently ignore — user may not be logged in
    } finally {
      set({ loading: false });
    }
  },

  markOne: async (id: string) => {
    await markRead(id);
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  },

  markAll: async () => {
    await markAllRead();
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
    }));
  },
}));
