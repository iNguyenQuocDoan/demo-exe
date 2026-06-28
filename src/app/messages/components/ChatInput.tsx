"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Wifi, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  isConnected: boolean;
  connectionError: string | null;
  onSendMessage: (content: string) => Promise<void>;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  isConnected,
  connectionError,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isOnline = isConnected && !connectionError;

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending || !isOnline) return;

    setInputText("");
    setSending(true);
    try {
      await onSendMessage(text);
      // Lấy lại focus sau khi gửi
      textareaRef.current?.focus();
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // Tự động điều chỉnh độ cao của textarea khi nhập nội dung dài
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [inputText]);

  return (
    <div className="p-3.5 border-t border-border bg-card shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
      {/* Indicator trạng thái kết nối */}
      <div className="flex items-center justify-between mb-2">
        {!isOnline ? (
          <span className="text-[10px] text-amber-500 animate-pulse font-semibold flex items-center gap-1.5 select-none">
            <Loader2 className="h-3 w-3 animate-spin" /> Đang kết nối chat...
          </span>
        ) : (
          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1.5 select-none">
            <Wifi className="h-3 w-3" /> Sẵn sàng gửi tin nhắn realtime
          </span>
        )}
      </div>

      {/* Vùng soạn thảo tin nhắn */}
      <div className="flex gap-2.5 items-end">
        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isOnline
              ? "Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
              : "Vui lòng đợi kết nối lại chat..."
          }
          rows={1}
          disabled={!isOnline || sending}
          className="flex-1 min-h-[40px] max-h-[120px] resize-none rounded-xl border border-border bg-muted/20 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:bg-background transition-all disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-foreground/60 scrollbar-thin py-2"
        />
        <Button
          onClick={handleSend}
          disabled={!inputText.trim() || sending || !isOnline}
          className="h-10 w-10 shrink-0 rounded-xl cursor-pointer shadow-sm active:scale-95 transition-transform"
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
