"use client";
import React, { useEffect, useRef, useState } from "react";
import NextImage from "next/image";
import { Send, Wifi, WifiOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";
import type { Booking, User } from "@/types";
import { BOOKING_STATUS_META } from "@/lib/bookingStatus";
import { Badge } from "@/components/ui/badge";

export interface BookingChatContext {
  bookingId: string;
  status?: Booking["status"];
  bookingHref?: string;
}

interface Props {
  convId: string;
  currentUser: User;
  otherName: string;
  bookingContext?: BookingChatContext;
}

export function ChatBox({ convId, currentUser, otherName, bookingContext }: Props) {
  // Phân tích partnerId từ convId cũ (dạng parentId_tutorId) để tương thích ngược
  const parts = convId?.split("_") ?? [];
  const partnerId = currentUser.role === "parent" ? parts[1] : parts[0];

  const { messages, send, isConnected, isLoading } = useChat(partnerId || convId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    await send(text);
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[hsl(214_32%_91%)] bg-white">
      <div className="border-b border-[hsl(214_32%_91%)] bg-[hsl(221_83%_98%)] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-[hsl(222_47%_11%)]">{otherName}</div>
            <div className="text-xs text-[hsl(215_16%_47%)]">Chat trực tiếp / Direct chat</div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {bookingContext?.status ? (
              <Badge variant={BOOKING_STATUS_META[bookingContext.status].variant} className="text-[11px]">
                {BOOKING_STATUS_META[bookingContext.status].label}
              </Badge>
            ) : null}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium",
                isConnected
                  ? "bg-[hsl(142_71%_90%)] text-[hsl(142_71%_30%)]"
                  : "bg-[hsl(38_92%_90%)] text-[hsl(38_92%_30%)]",
              )}
            >
              {isConnected ? (
                <>
                  <Wifi className="h-3 w-3" /> Realtime
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" /> Offline
                </>
              )}
            </div>
          </div>
        </div>

        {bookingContext?.bookingHref ? (
          <div className="mt-2">
            <Link
              href={bookingContext.bookingHref}
              className="text-xs font-medium text-[hsl(221_83%_53%)] hover:underline"
            >
              Xem chi tiết booking #{bookingContext.bookingId}
            </Link>
          </div>
        ) : null}
      </div>

      <div ref={messagesRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4" style={{ maxHeight: "360px" }}>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[hsl(221_83%_53%)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="py-8 text-center text-sm text-[hsl(215_16%_47%)]">
            Bắt đầu cuộc trò chuyện với {otherName}
          </div>
        ) : (
          messages.map((msg) => {
            const isMine = msg.senderId === currentUser.id;
            const senderName = isMine ? currentUser.fullName : otherName;
            return (
              <div key={msg.id} className={cn("flex gap-2", isMine ? "flex-row-reverse" : "flex-row")}>
                <NextImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`}
                  alt={senderName}
                  width={28}
                  height={28}
                  unoptimized
                  className="h-7 w-7 shrink-0 rounded-full border border-[hsl(214_32%_91%)]"
                />
                <div className={cn("flex flex-col gap-0.5", isMine ? "items-end" : "items-start")}>
                  <span className="text-xs text-[hsl(215_16%_47%)]">{senderName}</span>
                  <div
                    className={cn(
                      "max-w-[240px] break-words rounded-2xl px-4 py-2 text-sm",
                      isMine
                        ? "rounded-tr-sm bg-[hsl(221_83%_53%)] text-white"
                        : "rounded-tl-sm bg-[hsl(210_40%_96%)] text-[hsl(222_47%_11%)]",
                    )}
                  >
                    {msg.content}
                    {msg.status === "sending" && (
                      <span className="ml-1 text-[10px] text-white/70 italic">(đang gửi)</span>
                    )}
                  </div>
                  <span className="text-[10px] text-[hsl(215_16%_60%)]">
                    {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-[hsl(214_32%_91%)] p-3">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? "Nhập tin nhắn..." : "Mất kết nối..."}
            disabled={!isConnected}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-[hsl(214_32%_91%)] bg-white px-3 py-2 text-sm text-[hsl(222_47%_11%)] placeholder-[hsl(215_16%_57%)] outline-none focus:border-[hsl(221_83%_53%)] focus:ring-1 focus:ring-[hsl(221_83%_53%)] disabled:bg-muted"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || sending || !isConnected}
            aria-label="Gửi tin nhắn"
            title="Gửi tin nhắn"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(221_83%_53%)] text-white hover:bg-[hsl(221_83%_45%)] disabled:bg-[hsl(215_16%_90%)] disabled:text-[hsl(215_16%_60%)] cursor-pointer"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
