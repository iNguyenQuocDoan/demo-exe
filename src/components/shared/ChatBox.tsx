"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Send, Wifi, WifiOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/hooks/useChat";
import type { User } from "@/types";
import type { BookingFlowStatus } from "@/lib/bookingEnhancedMock";
import { Badge } from "@/components/ui/badge";
import {
  BookingContextCard,
  BookingFlowBadge,
  ChatOwnerChangeNote,
} from "@/components/booking/EnhancedBookingBlocks";

export interface BookingChatContext {
  bookingId: string;
  status: BookingFlowStatus;
  ownerName: string;
  ownerRole: string;
  latestOwnerChange?: string | null;
  bookingHref?: string;
}

interface Props {
  convId: string;
  currentUser: User;
  otherName: string;
  bookingContext?: BookingChatContext;
}

export function ChatBox({ convId, currentUser, otherName, bookingContext }: Props) {
  const { messages, send, isConnected, isLoading } = useChat({ convId, currentUser });
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 120) {
      el.scrollTop = el.scrollHeight;
    }
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
            {bookingContext ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  You&apos;re chatting with: {bookingContext.ownerName} ({bookingContext.ownerRole})
                </Badge>
              </div>
            ) : (
              <div className="text-xs text-[hsl(215_16%_47%)]">Chat trực tiếp / Direct chat</div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {bookingContext ? <BookingFlowBadge status={bookingContext.status} className="text-[11px]" /> : null}
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

        {bookingContext ? (
          <>
            <ChatOwnerChangeNote latestOwnerChange={bookingContext.latestOwnerChange ?? null} />
            <div className="mt-2">
              <BookingContextCard
                bookingId={bookingContext.bookingId}
                status={bookingContext.status}
                contactOwnerText={`${bookingContext.ownerName} (${bookingContext.ownerRole})`}
                bookingHref={bookingContext.bookingHref}
              />
            </div>
          </>
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
            return (
              <div key={msg.id} className={cn("flex gap-2", isMine ? "flex-row-reverse" : "flex-row")}>
                <Image
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`}
                  alt={msg.senderName}
                  width={28}
                  height={28}
                  unoptimized
                  className="h-7 w-7 shrink-0 rounded-full border border-[hsl(214_32%_91%)]"
                />
                <div className={cn("flex flex-col gap-0.5", isMine ? "items-end" : "items-start")}>
                  <span className="text-xs text-[hsl(215_16%_47%)]">{msg.senderName}</span>
                  <div
                    className={cn(
                      "max-w-[240px] break-words rounded-2xl px-4 py-2 text-sm",
                      isMine
                        ? "rounded-tr-sm bg-[hsl(221_83%_53%)] text-white"
                        : "rounded-tl-sm bg-[hsl(210_40%_96%)] text-[hsl(222_47%_11%)]",
                    )}
                  >
                    {msg.content}
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

      <div className="flex items-end gap-2 border-t border-[hsl(214_32%_91%)] p-3">
        <textarea
          className="min-h-[40px] max-h-[120px] flex-1 resize-none rounded-xl border border-[hsl(214_32%_91%)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(221_83%_53%)]"
          placeholder="Nhập tin nhắn... (Enter để gửi)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          onClick={() => void handleSend()}
          disabled={!input.trim() || sending}
          className="h-10 w-10 shrink-0 rounded-xl bg-[hsl(221_83%_53%)] text-white transition-colors hover:bg-[hsl(221_83%_43%)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : <Send className="mx-auto h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
