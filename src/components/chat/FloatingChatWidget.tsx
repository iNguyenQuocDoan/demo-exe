"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, MessageSquare, Send, X } from "lucide-react";
import { getConversations, sendMessage, subscribeMessages } from "@/api/chatApi";
import type { ChatMessage, Conversation } from "@/api/chatApi";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type WidgetState = "closed" | "list" | "chat";

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)}p`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function FloatingChatWidgetInner({ userId }: { userId: string }) {
  const { user } = useAuthStore();
  const [state, setState] = useState<WidgetState>("closed");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConversations(userId, "parent").then(setConversations).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!activeConv) return;
    const unsub = subscribeMessages(activeConv.convId, (msgs) => {
      setMessages(msgs);
    });
    return unsub;
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openConv = (conv: Conversation) => {
    setActiveConv(conv);
    setMessages([]);
    setState("chat");
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeConv || !user) return;
    const text = inputText;
    setInputText("");
    setSending(true);
    try {
      await sendMessage(
        activeConv.convId,
        { id: user.id, name: user.fullName, role: user.role },
        text,
      );
      getConversations(userId, "parent").then(setConversations).catch(() => {});
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const tutorName = activeConv
    ? (activeConv.tutorName || `Gia sư #${activeConv.tutorId}`)
    : "";

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Panel */}
      {state !== "closed" && (
        <div className="absolute bottom-14 right-0 w-80 rounded-2xl border border-border bg-card shadow-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
            {state === "chat" ? (
              <button
                type="button"
                onClick={() => { setState("list"); setActiveConv(null); }}
                className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                {tutorName}
              </button>
            ) : (
              <span className="text-sm font-semibold text-foreground">Tin nhắn</span>
            )}
            <button
              type="button"
              onClick={() => { setState("closed"); setActiveConv(null); }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* List state */}
          {state === "list" && (
            <div className="flex flex-col max-h-96 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Chưa có cuộc trò chuyện nào.
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.convId}
                    type="button"
                    onClick={() => openConv(conv)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/50 last:border-0"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {getInitials(conv.tutorName || "G")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-medium text-foreground truncate">
                          {conv.tutorName || `Gia sư #${conv.tutorId}`}
                        </span>
                        {conv.lastMessageAt && (
                          <span className="text-xs text-muted-foreground shrink-0">
                            {timeAgo(conv.lastMessageAt)}
                          </span>
                        )}
                      </div>
                      {conv.lastMessage && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {conv.lastMessage}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
              <a
                href="/parent/chats"
                className="block px-4 py-2.5 text-center text-xs text-primary hover:text-primary/80 font-medium border-t border-border transition-colors"
              >
                Xem tất cả tin nhắn
              </a>
            </div>
          )}

          {/* Chat state */}
          {state === "chat" && activeConv && (
            <>
              <div className="flex flex-col gap-2 overflow-y-auto p-3 max-h-64">
                {messages.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-4">
                    Chưa có tin nhắn nào. Bắt đầu trò chuyện!
                  </p>
                )}
                {messages.map((msg) => {
                  const isOwn = msg.senderId === userId;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col gap-0.5 max-w-[85%]",
                        isOwn ? "self-end items-end" : "self-start items-start",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-3 py-1.5 text-sm leading-relaxed",
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-muted text-foreground rounded-bl-sm",
                        )}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[10px] text-muted-foreground px-1">
                        {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex items-center gap-2 border-t border-border p-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Nhắn tin..."
                  className="flex-1 rounded-xl border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary transition-colors"
                />
                <Button
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-xl"
                  disabled={!inputText.trim() || sending}
                  onClick={() => void handleSend()}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating button */}
      <button
        type="button"
        onClick={() => setState(state === "closed" ? "list" : "closed")}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all active:scale-95"
        aria-label="Mở chat"
      >
        {state !== "closed" ? (
          <X className="h-5 w-5" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-5 w-5" />
            {conversations.length > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {conversations.length > 9 ? "9+" : conversations.length}
              </span>
            )}
          </div>
        )}
      </button>
    </div>
  );
}

export function FloatingChatWidget() {
  const { user } = useAuthStore();
  if (!user || user.role !== "parent") return null;
  return <FloatingChatWidgetInner userId={user.id} />;
}
