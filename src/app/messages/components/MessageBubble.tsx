"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChatMessage } from "@/api/chatApi";

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  senderName: string;
  onRetrySend?: (content: string) => void;
}

function getInitials(name: string): string {
  if (!name) return "U";
  return name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMine,
  senderName,
  onRetrySend,
}) => {
  const isFailed = message.status === "failed";
  const isSending = message.status === "sending";

  const formattedTime = (() => {
    try {
      return new Date(message.createdAt).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  })();

  return (
    <div
      className={cn(
        "flex gap-2.5 items-start max-w-full md:max-w-[85%]",
        isMine ? "flex-row-reverse ml-auto" : "flex-row mr-auto"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0 border border-border shadow-sm">
        <AvatarImage
          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${message.senderId}`}
          alt={senderName}
        />
        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
          {getInitials(senderName)}
        </AvatarFallback>
      </Avatar>

      {/* Bong bóng tin nhắn */}
      <div className={cn("flex flex-col gap-0.5 min-w-0", isMine ? "items-end" : "items-start")}>
        {/* Tên người gửi */}
        <span className="text-[9px] text-muted-foreground/80 px-1 truncate max-w-[150px]">
          {senderName}
        </span>

        {/* Khung nội dung */}
        <div className="flex items-center gap-1.5 group">
          {isFailed && isMine && onRetrySend && (
            <Badge
              variant="destructive"
              className="h-5 px-1.5 py-0 gap-0.5 text-[9px] font-semibold shrink-0 cursor-pointer hover:bg-destructive/90 transition-all select-none"
              onClick={() => onRetrySend(message.content)}
              title="Click để gửi lại"
            >
              <AlertCircle className="h-3 w-3" /> Lỗi gửi
            </Badge>
          )}

          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed break-words shadow-sm transition-all duration-300",
              isMine
                ? "bg-primary text-primary-foreground rounded-tr-sm"
                : "bg-card text-foreground border border-border/50 rounded-tl-sm",
              isFailed ? "opacity-75 border-destructive bg-destructive/5 text-destructive" : "",
              isSending ? "bg-primary/80 animate-pulse" : ""
            )}
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
        </div>

        {/* Thời gian */}
        <div className="flex items-center gap-1 px-1 mt-0.5">
          <span className="text-[9px] text-muted-foreground/75">
            {formattedTime}
          </span>
          {isSending && (
            <span className="text-[9px] text-primary/75 italic animate-pulse">
              (đang gửi...)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
