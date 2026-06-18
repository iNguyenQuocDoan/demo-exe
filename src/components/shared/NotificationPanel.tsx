"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, BookOpen, Wallet, Star, Flag, UserCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import type { NotificationType } from "@/types";
import { cn, parseBeDate } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

function notifIcon(type: NotificationType) {
  if (type.startsWith("booking")) return <BookOpen className="h-4 w-4 text-primary" />;
  if (type.startsWith("deposit") || type.startsWith("withdraw")) return <Wallet className="h-4 w-4 text-emerald-500" />;
  if (type === "new_review") return <Star className="h-4 w-4 text-amber-500" />;
  if (type.startsWith("report")) return <Flag className="h-4 w-4 text-destructive" />;
  if (type.startsWith("application")) return <UserCheck className="h-4 w-4 text-blue-500" />;
  return <Bell className="h-4 w-4 text-muted-foreground" />;
}

function formatNotificationTime(dateStr: string): string {
  try {
    const date = parseBeDate(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Xử lý khi thông báo mới dưới 60 giây hoặc do lệch clock hệ thống nhẹ
    if (diffInSeconds < 60) {
      return "Vừa xong";
    }
    if (diffInSeconds < 3600) {
      const mins = Math.floor(diffInSeconds / 60);
      return `${mins} phút trước`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ trước`;
    }
    
    // Nếu khoảng cách lớn hơn 7 ngày, trả về thời gian tuyệt đối dd/MM/yyyy HH:mm
    if (diffInSeconds > 7 * 86400) {
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    }

    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  } catch {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString("vi-VN");
    } catch {
      return "—";
    }
  }
}

export function NotificationPanel() {
  const { user } = useAuthStore();
  const { notifications, loading, fetch, markOne, markAll } = useNotificationStore();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) fetch();
  }, [user, fetch]);

  // Polling — refresh every 30s while panel is closed
  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => fetch(), 30_000);
    return () => clearInterval(id);
  }, [user, fetch]);

  // Refetch notifications and unread count immediately when dropdown is opened
  useEffect(() => {
    if (open && user) {
      void fetch();
    }
  }, [open, user, fetch]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [open]);

  if (!user) return null;

  const unread = notifications.filter((n) => !n.isRead).length;

  const handleClick = (n: { id: string; isRead: boolean }) => {
    if (!n.isRead) markOne(n.id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Thông báo"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border transition-colors hover:bg-muted"
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground shadow">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-border bg-card shadow-xl shadow-primary/5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Thông báo</span>
              {unread > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
                  {unread}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAll()}
                  title="Đánh dấu tất cả đã đọc"
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Đọc tất cả
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="space-y-3 p-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Chưa có thông báo nào</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => {
                  const inner = (
                    <div
                      className={cn(
                        "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
                        !n.isRead && "bg-primary/5"
                      )}
                      onClick={() => handleClick(n)}
                    >
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                        {notifIcon(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("text-sm leading-tight", !n.isRead ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}>
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground/70">
                          {formatNotificationTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                  return (
                    <li key={n.id} className="border-b border-border/50 last:border-0">
                      {n.link ? <Link href={n.link}>{inner}</Link> : inner}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
