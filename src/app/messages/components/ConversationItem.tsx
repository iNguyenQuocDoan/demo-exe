"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Conversation } from "@/api/chatApi";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function timeAgo(isoString: string): string {
  if (!isoString) return "";
  try {
    const diff = (Date.now() - new Date(isoString).getTime()) / 1000;
    if (diff < 60) return "vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return new Date(isoString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  } catch {
    return "";
  }
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

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick,
}) => {
  const initials = getInitials(conversation.partnerName || conversation.partnerId);
  const displayName = conversation.partnerName || `Người dùng (#${conversation.partnerId.substring(0, 8)})`;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-all relative border-l-3 border-transparent hover:bg-muted/40",
        isActive ? "bg-primary/5 border-l-primary" : ""
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="h-11 w-11 border border-border shadow-sm">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${conversation.partnerId}`}
            alt={displayName}
          />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {!conversation.read && !isActive && (
          <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-primary border-2 border-card" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1.5">
          <span className={cn(
            "text-sm truncate text-foreground",
            !conversation.read && !isActive ? "font-bold" : "font-semibold"
          )}>
            {displayName}
          </span>
          {conversation.time && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {timeAgo(conversation.time)}
            </span>
          )}
        </div>
        <p
          className={cn(
            "text-xs truncate mt-0.5",
            !conversation.read && !isActive ? "font-semibold text-foreground" : "text-muted-foreground"
          )}
        >
          {conversation.lastMessage || "Bắt đầu cuộc trò chuyện mới"}
        </p>
      </div>
    </button>
  );
};
