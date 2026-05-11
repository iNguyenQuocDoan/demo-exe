import { db } from "../db";
import type { AppNotification } from "@/types";

function currentUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const u = JSON.parse(localStorage.getItem("auth_user") ?? "null") as { id: string } | null;
    return u?.id ?? null;
  } catch {
    return null;
  }
}

export function handleGetNotifications() {
  const userId = currentUserId();
  if (!userId) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  const list = db.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return { status: 200, data: { ok: true, notifications: list } };
}

export function handleMarkRead(id: string) {
  const userId = currentUserId();
  if (!userId) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  const notif = db.notifications.find((n) => n.id === id && n.userId === userId);
  if (!notif) return { status: 404, data: { ok: false, error: "Not found" } };
  notif.isRead = true;
  db.saveNotifications();
  return { status: 200, data: { ok: true } };
}

export function handleMarkAllRead() {
  const userId = currentUserId();
  if (!userId) return { status: 401, data: { ok: false, error: "Unauthorized" } };
  db.notifications.filter((n) => n.userId === userId).forEach((n) => { n.isRead = true; });
  db.saveNotifications();
  return { status: 200, data: { ok: true } };
}

// Internal helper — used by other handlers to push a notification
export function pushNotification(n: Omit<AppNotification, "id" | "createdAt" | "isRead">) {
  const notif: AppNotification = {
    ...n,
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(notif);
  db.saveNotifications();
  return notif;
}
